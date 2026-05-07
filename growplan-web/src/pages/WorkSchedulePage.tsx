import { useMemo } from 'react'
import {
  ArrowLeft,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Grid3X3,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
  Users,
  Waves,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { cropLibrary, type CropId } from '../constants/crops'
import { generatePlanData } from '../lib/planGenerator'
import type { GeneratedPlanData, GoalData, SetupFarmData } from '../types/planning'

type WorkScheduleMode = 'employer' | 'employee'

type WorkScheduleTask = {
  id: string
  title: string
  timeWindow: 'Morning' | 'Midday' | 'Afternoon'
  priority: 'High' | 'Medium' | 'Low'
  minutes: number
  assignee: string
  zone: string
  reason: string
  instruction: string
  doneWhen: string
}

type WorkSchedulePageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  generatedPlan: GeneratedPlanData | null
  mode: WorkScheduleMode
  completedTaskIds: string[]
  onToggleTask: (taskId: string) => void
  onBack: () => void
}

const assignees = ['NK', 'PP', 'TM', 'AL']

const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1,
} as const

export function WorkSchedulePage({
  farm,
  selectedCropIds,
  goalData,
  generatedPlan,
  mode,
  completedTaskIds,
  onToggleTask,
  onBack,
}: WorkSchedulePageProps) {
  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const resolvedPlan = useMemo(
    () =>
      generatedPlan ??
      generatePlanData({
        farm,
        selectedCropIds,
        goalData,
      }),
    [farm, generatedPlan, goalData, selectedCropIds],
  )

  const tasks = useMemo<WorkScheduleTask[]>(() => {
    const cropById = new Map(cropLibrary.map((crop) => [crop.id, crop]))
    const generated: WorkScheduleTask[] = []

    resolvedPlan.nurserySchedule.slice(0, 2).forEach((batch, index) => {
      generated.push({
        id: `seed-${batch.cropId}-${batch.seedWeek}-${index}`,
        title: `Seed ${batch.seedlings} ${batch.label} seedlings`,
        timeWindow: 'Morning',
        priority: index === 0 ? 'High' : 'Medium',
        minutes: 30 + index * 10,
        assignee: assignees[index % assignees.length],
        zone: `Nursery Rack ${String.fromCharCode(65 + index)}`,
        reason: `Ready for transplant by Week ${batch.transplantWeek} using ${farm.seedlingLeadDays}-day lead time.`,
        instruction: `Prepare ${batch.seedlings} cells, place 1 seed per cell, and mist evenly after seeding.`,
        doneWhen: `${batch.seedlings} cells are seeded, labeled, and moved to Nursery Rack ${String.fromCharCode(65 + index)}.`,
      })
    })

    resolvedPlan.timelineRows.slice(0, 2).forEach((row, index) => {
      generated.push({
        id: `transplant-${row.cropId}-${row.transplantWeek}-${index}`,
        title: `Transplant ${row.label} batch W${row.transplantWeek}`,
        timeWindow: 'Midday',
        priority: 'Medium',
        minutes: 40 + index * 5,
        assignee: assignees[(index + 2) % assignees.length],
        zone: `Grid ${String.fromCharCode(65 + index)}${index + 2}-${String.fromCharCode(65 + index)}${index + 5}`,
        reason: `Aligns growth window to harvest in Week ${row.harvestWeek}.`,
        instruction: `Transplant the scheduled tray batch, keep spacing consistent, and verify drip flow for each row.`,
        doneWhen: `${row.label} trays are transplanted and irrigation check is complete for ${String.fromCharCode(65 + index)} rows.`,
      })
    })

    const highRisk = resolvedPlan.seedlingCapacityRisk === 'High'
    const mintCrop = selectedCrops.find((crop) => crop.id === 'mint')
    const firstCrop = cropById.get(resolvedPlan.timelineRows[0]?.cropId ?? 'lettuce')

    generated.push({
      id: 'harvest-zone',
      title: `Harvest ${firstCrop?.name ?? 'Lettuce'} Zone 2`,
      timeWindow: 'Afternoon',
      priority: 'High',
      minutes: 55,
      assignee: assignees[1],
      zone: 'Zone 2',
      reason: 'Prevents stockout before next cycle handoff.',
      instruction: `Harvest mature heads only. Keep damaged plants separate and record total harvested count.`,
      doneWhen: 'Target harvest count is packed and recorded in the shift log.',
    })

    generated.push({
      id: 'sensor-ec',
      title: 'Adjust EC in Zone A',
      timeWindow: 'Afternoon',
      priority: highRisk ? 'High' : 'Low',
      minutes: 20,
      assignee: assignees[3],
      zone: 'Zone A',
      reason: highRisk
        ? 'Nursery load is tight; nutrient stability reduces transplant stress.'
        : 'Keep nutrient profile stable across active rows.',
      instruction: highRisk
        ? 'Measure EC, then adjust nutrient mix in small steps to reach 1.8-1.9 mS/cm.'
        : 'Measure EC and correct to 1.8 mS/cm standard setting for Zone A.',
      doneWhen: 'EC is stable in range and re-check after 15 minutes confirms no drift.',
    })

    if (mintCrop) {
      generated.push({
        id: 'mint-edge-check',
        title: 'Check Mint edge row',
        timeWindow: 'Midday',
        priority: 'Low',
        minutes: 15,
        assignee: assignees[0],
        zone: 'Edge Row E',
        reason: 'Mint spreads quickly. Early check avoids crowding nearby crops.',
        instruction: 'Inspect edge row for spread into adjacent cells and trim overgrowth if needed.',
        doneWhen: 'Edge row is clear, trimmed, and no mint overlap into neighboring crop cells.',
      })
    }

    return generated
      .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])
      .slice(0, 6)
  }, [farm.seedlingLeadDays, resolvedPlan, selectedCrops])

  const groupedTasks = useMemo(() => {
    const groups: Record<'Morning' | 'Midday' | 'Afternoon', WorkScheduleTask[]> = {
      Morning: [],
      Midday: [],
      Afternoon: [],
    }
    tasks.forEach((task) => groups[task.timeWindow].push(task))
    return groups
  }, [tasks])
  const toggleTaskDone = (taskId: string) => {
    if (mode !== 'employee') return
    onToggleTask(taskId)
  }

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
  const laborHours = (totalMinutes / 60).toFixed(1)
  const completedSet = useMemo(() => {
    const userSet = new Set(completedTaskIds)
    if (mode === 'employer' && userSet.size === 0) {
      tasks
        .filter((task) => task.timeWindow === 'Morning')
        .forEach((task) => userSet.add(task.id))
    }
    return userSet
  }, [completedTaskIds, mode, tasks])
  const completedCount = tasks.filter((task) => completedSet.has(task.id)).length
  const completedPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
  const readyHarvest = resolvedPlan.timelineRows.filter((row) => row.harvestWeek <= 3).length
  const peakNursery = Math.max(...resolvedPlan.nurseryLoad.map((item) => item.activeSeedlings), 0)
  const staffLoadPercent = Math.min(100, Math.round((totalMinutes / (assignees.length * 120)) * 100))
  const nurseryLoadPercent =
    farm.nurseryCapacity > 0 ? Math.min(100, Math.round((peakNursery / farm.nurseryCapacity) * 100)) : 0
  const pendingByAssignee = useMemo(() => {
    const counts = new Map<string, number>()
    tasks.forEach((task) => {
      if (completedSet.has(task.id)) return
      counts.set(task.assignee, (counts.get(task.assignee) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [completedSet, tasks])

  const accountInitials =
    farm.farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'
  const accountName = mode === 'employer' ? farm.farmName : 'Employee Shift'

  return (
    <main className="dashboard-shell work-schedule-shell">
      <aside className="dashboard-side">
        <nav className="dashboard-nav">
          {mode === 'employer' ? (
            <>
              <button type="button" className="tab-key-overview" onClick={onBack}>
                <Grid3X3 size={18} />
                <span>Overview</span>
              </button>
              <button type="button">
                <Sprout size={18} />
                <span>Farm Grid</span>
              </button>
              <button type="button">
                <CalendarDays size={18} />
                <span>Plan</span>
              </button>
              <button type="button" className="active tab-key-work-schedule">
                <Sparkles size={18} />
                <span>Work Schedule</span>
              </button>
              <button type="button">
                <Leaf size={18} />
                <span>Crops</span>
              </button>
              <button type="button">
                <Waves size={18} />
                <span>Sensors</span>
              </button>
              <button type="button">
                <Bell size={18} />
                <span>Alerts</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" className="active tab-key-work-schedule">
                <Sparkles size={18} />
                <span>Work Schedule</span>
              </button>
            </>
          )}
        </nav>
      </aside>

      <section className="dashboard-main work-schedule-main">
        <AppHeader accountName={accountName} accountInitials={accountInitials} variant="edge" />

        <section className="schedule-page-head">
          <div className="dashboard-title">
            <h1>AI Work Schedule</h1>
          </div>
          <div className="dashboard-top-actions">
            <span className="schedule-role-badge">
              {mode === 'employer' ? 'Employer View' : 'Employee View'}
            </span>
            <button type="button" className="farm-selector">
              Today
              <CalendarDays size={15} />
            </button>
          </div>
        </section>

        <section className="dashboard-kpis schedule-kpis">
          <article>
            <p>Tasks today</p>
            <strong>{tasks.length}</strong>
          </article>
          <article>
            <p>Labor hours</p>
            <strong>{laborHours}h</strong>
          </article>
          <article>
            <p>Nursery load</p>
            <strong>{peakNursery}</strong>
          </article>
          <article>
            <p>Harvest ready</p>
            <strong>{readyHarvest}</strong>
          </article>
          {mode === 'employer' ? (
            <button type="button" className="risk-kpi assign-kpi">
              <p>Team Progress</p>
              <strong>
                {completedCount}/{tasks.length} done
              </strong>
              <span>{completedPercent}% completed</span>
              <span className="kpi-progress-track">
                <b style={{ width: `${completedPercent}%` }}></b>
              </span>
              <span className="team-progress-pending">
                {pendingByAssignee.length > 0
                  ? `Pending: ${pendingByAssignee.map(([assignee, count]) => `${assignee} ${count}`).join(' | ')}`
                  : 'All assigned tasks are completed'}
              </span>
            </button>
          ) : (
            <article className="goal-kpi">
              <p>Completed</p>
              <strong>
                {completedCount}/{tasks.length}
              </strong>
              <span>{completedPercent}% completed</span>
              <span className="completed-progress-track">
                <b style={{ width: `${completedPercent}%` }}></b>
              </span>
            </article>
          )}
        </section>

        <section className="schedule-layout">
          <section className="schedule-board-card">
            <header>
              <h2>AI suggested schedule</h2>
              <p>{mode === 'employer' ? 'Manager assignment view' : 'Staff execution view'}</p>
            </header>

            <div className="schedule-capacity-row">
              <article>
                <div>
                  <Users size={14} />
                  Staff workload
                </div>
                <strong>{staffLoadPercent}%</strong>
                <span className="capacity-track">
                  <b style={{ width: `${staffLoadPercent}%` }}></b>
                </span>
              </article>
              <article>
                <div>
                  <Waves size={14} />
                  Nursery capacity
                </div>
                <strong>{nurseryLoadPercent}%</strong>
                <span className="capacity-track">
                  <b style={{ width: `${nurseryLoadPercent}%` }}></b>
                </span>
              </article>
            </div>

            <div className="schedule-groups">
              {(['Morning', 'Midday', 'Afternoon'] as const).map((window) => (
                <article key={window} className="schedule-group">
                  <h3>{window}</h3>
                  {groupedTasks[window].map((task) => (
                    <div
                      key={task.id}
                      className={`schedule-task priority-${task.priority.toLowerCase()} ${completedSet.has(task.id) ? 'done' : ''}`}
                    >
                      <div className="task-main">
                        {mode === 'employee' ? (
                          <button
                            type="button"
                            className={`task-check-btn ${completedSet.has(task.id) ? 'done' : ''}`}
                            aria-label={`Toggle ${task.title}`}
                            onClick={() => toggleTaskDone(task.id)}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        <div>
                          <p>{task.title}</p>
                          <span>
                            <Clock3 size={12} />
                            {task.minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="task-meta">
                        {task.priority === 'High' ? (
                          <span className="task-priority-label">! High priority</span>
                        ) : null}
                        <small>{task.zone}</small>
                        {mode === 'employer' ? (
                          <b>
                            <UserRound size={12} />
                            {task.assignee}
                          </b>
                        ) : null}
                      </div>
                      {mode === 'employee' ? (
                        <div className="task-detail">
                          <p>{task.instruction}</p>
                          <span>
                            <strong>Done when:</strong> {task.doneWhen}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <aside className="schedule-insight-card">
            <header>
              <h2>
                <Bot size={16} />
                Why these tasks today?
              </h2>
            </header>
            <div className="insight-list">
              {tasks.slice(0, mode === 'employer' ? 4 : 3).map((task) => (
                <article key={task.id}>
                  <p>{task.title}</p>
                  <span>{task.reason}</span>
                </article>
              ))}
            </div>
            <div className="employee-note">
              <ShieldCheck size={15} />
              AI scheduled this sequence to keep transplant timing aligned with the confirmed plan.
            </div>
            <button type="button" className="back-confirm-btn" onClick={onBack}>
              <ArrowLeft size={16} />
              {mode === 'employer' ? 'Back to Dashboard' : 'Back to Welcome'}
            </button>
          </aside>
        </section>
      </section>
    </main>
  )
}
