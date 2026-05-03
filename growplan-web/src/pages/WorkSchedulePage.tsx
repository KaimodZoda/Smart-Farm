import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Leaf,
  ShieldCheck,
  Sparkles,
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
}

type WorkSchedulePageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  generatedPlan: GeneratedPlanData | null
  mode: WorkScheduleMode
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
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set())

  const toggleTaskDone = (taskId: string) => {
    if (mode !== 'employee') return
    setCompletedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
  const laborHours = (totalMinutes / 60).toFixed(1)
  const completedCount = completedTaskIds.size
  const readyHarvest = resolvedPlan.timelineRows.filter((row) => row.harvestWeek <= 3).length
  const peakNursery = Math.max(...resolvedPlan.nurseryLoad.map((item) => item.activeSeedlings), 0)
  const staffLoadPercent = Math.min(100, Math.round((totalMinutes / (assignees.length * 120)) * 100))
  const nurseryLoadPercent =
    farm.nurseryCapacity > 0 ? Math.min(100, Math.round((peakNursery / farm.nurseryCapacity) * 100)) : 0

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
        <div className="dashboard-logo-box">
          <Leaf size={20} />
        </div>
        <nav className="dashboard-nav">
          <button type="button">
            <CalendarDays size={18} />
            <span>Overview</span>
          </button>
          <button type="button" className="active">
            <Sparkles size={18} />
            <span>Work Schedule</span>
          </button>
        </nav>
      </aside>

      <section className="dashboard-main work-schedule-main">
        <AppHeader accountName={accountName} accountInitials={accountInitials} />

        <header className="schedule-page-head">
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
        </header>

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
              <p>Ready for staff handoff</p>
              <strong>Assign Tasks</strong>
            </button>
          ) : (
            <article className="goal-kpi">
              <p>Completed</p>
              <strong>
                {completedCount}/{tasks.length}
              </strong>
              <span>Keep task order by priority</span>
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
                      className={`schedule-task priority-${task.priority.toLowerCase()} ${completedTaskIds.has(task.id) ? 'done' : ''}`}
                    >
                      <div className="task-main">
                        {mode === 'employee' ? (
                          <button
                            type="button"
                            className={`task-check-btn ${completedTaskIds.has(task.id) ? 'done' : ''}`}
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
                        <small>{task.zone}</small>
                        {mode === 'employer' ? (
                          <b>
                            <UserRound size={12} />
                            {task.assignee}
                          </b>
                        ) : null}
                      </div>
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
