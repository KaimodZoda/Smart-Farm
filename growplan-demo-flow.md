# AgriMatrix Demo Flow

## Demo Goal

Build a 2-day hackathon PoC that follows the existing UI mockup flow:

```text
Welcome
-> Setup Farm
-> Select Crops
-> Define Goal
-> Generate Plan
-> Confirm Plan
-> Dashboard / Re-plan
```

Current implementation status:

- Done: Welcome -> Setup Farm -> Select Crops -> Define Goal -> Generate Plan -> Confirm Plan -> Dashboard
- Next: tighten plan logic, polish dashboard, and wire template re-plan behavior

The wizard should feel stable and deterministic. The demo Copilot should appear only in the Dashboard / Re-plan experience, after the system has already generated and confirmed a plan.

## Core Product Idea

AgriMatrix helps a controlled-farm operator turn farm setup, nursery capacity, selected crops, and production goals into an actionable planting layout. The planning flow creates the plan with deterministic rules. The demo Copilot then explains the confirmed plan and supports re-planning when constraints change.

Main message:

> AgriMatrix creates a clear planting and seedling schedule first, then lets operators ask why the plan works or how to adapt it when real conditions change.

## Demo Copilot Scope

For the 2-day demo, do not use a live LLM. Use pre-defined prompt chips and plan-aware template responses only.

Do not show or run the Copilot during:

- Setup Farm
- Select Crops
- Define Goal
- Generate Plan
- Confirm Plan

Those pages should use local state, deterministic rule/layout logic, and template copy so the demo remains fast and reliable.

Show pre-defined Copilot prompts in Dashboard / Re-plan for:

- Why this layout?
- Explain risk
- Show alternatives
- What if I only have 2 pots?
- What if I can water only every other day?
- Incident response, such as lettuce delayed by 5 days

Recommended demo prompt chips:

- Why is Mint placed at the edge?
- Why is this plan 100% utilized?
- What is the seedling capacity risk?
- What should I seed next week?
- What if Lettuce is delayed by 5 days?
- Show me a safer plan

Each prompt should map to a deterministic template response that references the current generated plan, reason tags, nursery schedule, and incident state.

## Source of Truth

The rule/layout engine is the source of truth.

Current app behavior:

- `Generate Plan` produces one deterministic generated-plan object
- `Confirm Plan` reads that same generated plan
- `Dashboard` reads that same generated plan
- Grid layout, crop mix, utilization, revenue, and stockout risk are intended to stay in sync across these pages
- Nursery schedule, transplant timing, and seedling capacity risk should stay in sync with the generated plan

The demo Copilot templates should receive:

- Farm setup
- Selected crop attributes
- Defined goal
- Generated plan JSON
- Nursery / seedling schedule
- Reason tags from the rule/layout engine
- Current dashboard incident or user question

The demo Copilot should not invent a new layout. If re-planning is needed, the app should convert the selected scenario into structured constraints, run the rule/layout engine again, and then show a template explanation for the updated plan.

## Recommended Tech Stack

- Vite
- React
- TypeScript
- Plain CSS or CSS modules
- lucide-react for icons
- Mock rule/layout engine in frontend
- Template Copilot for Dashboard / Re-plan explanation
- Optional LLM upgrade later, after the rule engine and data contracts are stable

## Plant Catalog

The demo should use 4 crops. User can select any non-empty combination.

Total combinations:

```text
2^4 = 16 total combinations
15 valid combinations if empty selection is not allowed
```

Recommended crop catalog:

| Crop | Category | Light | Water | Growth Behavior | Demo Role |
|---|---|---|---|---|---|
| Basil | Herb | High | Medium | Compact | Friendly companion crop |
| Kale | Leafy green | Medium-high | Medium-high | Upright | High-yield leafy crop |
| Mint | Herb | Medium | High | Spreading / aggressive | Should be separated or edge-placed |
| Lettuce | Leafy green | Medium | High | Compact | Easy main crop / water-loving crop |

Example plant attribute shape:

```json
{
  "id": "mint",
  "name": "Mint",
  "light": "medium",
  "water": "high",
  "growthHabit": "spreading",
  "spacing": "high",
  "compatibilityTags": ["edge_placement", "separate_if_possible"],
  "warnings": ["Can spread quickly and compete for space."]
}
```

## Main Demo Journey

```text
Welcome / Start
-> Setup Farm
-> Select Crops
-> Define Goal
-> Generate Plan
-> Confirm Plan
-> Dashboard / Re-plan
```

## Seedling / Nursery Strategy

Do not add a separate nursery page for the 2-day demo. Treat the nursery as a farm resource that affects the plan:

- Setup Farm captures nursery capacity and seedling lead time.
- Define Goal derives estimated seedlings needed per week from target, reserve, and yield per plant.
- Generate Plan creates both grid allocation and seedling schedule.
- Confirm Plan lets the user review transplant timing before starting.
- Dashboard shows nursery queue, ready-to-transplant batches, next seeding batch, and capacity risk.

## Page 1: Welcome / Start

Purpose:

Introduce AgriMatrix and start the demo.

Main UI:

- Product name: AgriMatrix
- Headline: Smart planting layouts for controlled farms
- Subheadline: Set up your farm, choose crops, generate a plan, then use Copilot prompts to explain and re-plan after confirmation.
- Primary CTA: Start Demo
- Visual preview:
  - Farm grid preview
  - Planting timeline preview
  - KPI preview

User action:

- Click Start Demo

## Page 2: Setup Farm

Purpose:

Capture the growing space and seedling capacity before the user chooses crops.

Main UI:

- Wizard sidebar progress
- Farm name
- Farm location
- Farm layout rows
- Farm layout columns
- Total grids
- Lighting zones
- Irrigation zones
- Nursery trays / seedling capacity
- Seedling days before transplant
- Growing system
- Farm layout preview
- Small nursery capacity preview
- CTA: Save & Continue

Recommended defaults:

```text
Farm name: GreenRise Farm
Location: Bangkok
Rows: 10
Columns: 12
Total grids: 120
Lighting zones: 3
Irrigation zones: 2
Nursery capacity: 240 seedlings
Seedling lead time: 14 days before transplant
Growing system: Hydroponic NFT
```

Example farm setup JSON:

```json
{
  "farmName": "GreenRise Farm",
  "location": "Bangkok",
  "rows": 10,
  "columns": 12,
  "totalGrids": 120,
  "lightingZones": 3,
  "irrigationZones": 2,
  "nurseryCapacity": 240,
  "seedlingDaysBeforeTransplant": 14,
  "growingSystem": "Hydroponic NFT"
}
```

## Page 3: Select Crops

Purpose:

Let the user choose any combination from the 4 demo crops.

Main UI:

- Wizard sidebar progress
- Crop library
- Search/filter UI
- Crop cards with image, category, growth cycle, expected yield
- Selected crops panel
- CTA: Continue

Default selected demo combination:

```text
Lettuce + Basil + Mint
```

Optional demo variation:

```text
Basil + Kale + Mint
```

Validation:

- Disable Continue when no crop is selected
- Show total selected crops and estimated yield

## Page 4: Define Goal

Purpose:

Capture production targets and planning priorities before generating the plan.

Main UI:

- Wizard sidebar progress
- Per-selected-crop goal inputs
  - Goal per week (kg)
  - Reserve percentage (%)
- Estimated seedlings needed per week
- Planning horizon
- Optimization priority segmented control
- Goal summary panel
- CTA: Generate Plan

Recommended defaults:

```text
Lettuce: 200 kg/week, reserve 15%
Basil: 120 kg/week, reserve 20%
Kale: 160 kg/week, reserve 12%
Mint: 90 kg/week, reserve 18%
Planning horizon: 8 weeks
Optimization priority: Maximize space utilization
Seedling estimates: derived from target, reserve, and crop yield per plant
```

Example goal JSON:

```json
{
  "planningHorizon": "8 weeks",
  "priority": "maximize-space",
  "cropGoals": {
    "lettuce": { "targetPerWeek": 200, "reservePercent": 15 },
    "basil": { "targetPerWeek": 120, "reservePercent": 20 },
    "kale": { "targetPerWeek": 160, "reservePercent": 12 },
    "mint": { "targetPerWeek": 90, "reservePercent": 18 }
  },
  "seedlingAssumptions": {
    "lettuce": { "yieldPerPlantKg": 0.18, "seedlingDays": 14 },
    "basil": { "yieldPerPlantKg": 0.08, "seedlingDays": 14 },
    "kale": { "yieldPerPlantKg": 0.16, "seedlingDays": 18 },
    "mint": { "yieldPerPlantKg": 0.05, "seedlingDays": 14 }
  }
}
```

## Page 5: Generate Plan

Purpose:

Simulate plan generation and preview the deterministic draft plan.

Main UI:

- Wizard sidebar progress
- Loading/progress state
- Generation steps:
  - Analyzing farm layout
  - Balancing crop cycles
  - Optimizing grid allocation
  - Scheduling seedling batches
  - Forecasting harvest schedule
- Draft plan preview
- Mini grid allocation
- Mini harvest timeline
- Mini nursery schedule
- KPI preview
- CTA: View Draft Plan

Behavior:

- Show staged generation progress UI and draft preview.
- Generate a deterministic draft plan preview from farm setup, selected crops, and per-crop goals.
- Fill grid at 100% occupancy (no fallow cells) because empty lot is treated as lost profit.
- Generate a nursery schedule before transplant dates, using the seedling lead time from Setup Farm.
- Flag nursery capacity risk if planned seedlings exceed available nursery capacity.
- Do not show or run the Copilot here.

## Mock Rule/Layout Engine

The engine should be deterministic enough to feel credible but simple enough for a hackathon PoC.

Inputs:

- Farm setup
- Selected crops
- Defined goal
- Nursery capacity and seedling lead time
- Optional structured constraints from re-plan

Basic rules:

```text
If crops have similar light needs:
  place them in compatible lighting zones

If crops have similar water needs:
  place them in compatible irrigation zones

If a crop has aggressive or spreading growth:
  place it on an edge or isolate it when possible

Use per-crop reserve percentage:
  adjust each crop's required allocation by its reserve factor

If the priority is maximize utilization:
  fill all available grids (100% occupancy)

If the priority is minimize stockout risk:
  allocate more space to high-reserve / high-priority crops while still keeping 100% occupancy

For each selected crop:
  seedlingsPerWeek = ceil(targetKgPerWeek / yieldPerPlantKg)
  seedlingsWithReserve = ceil(seedlingsPerWeek * (1 + reservePercent / 100))
  seedingDate = transplantDate - seedlingDaysBeforeTransplant

If seedlings currently in nursery exceed nursery capacity:
  flag seedling capacity risk and suggest staggered seeding batches
```

Example generated plan JSON:

```json
{
  "planId": "greenrise-lettuce-basil-mint-8w",
  "summary": "Lettuce receives the main production zone, Basil is reserved at 20%, and Mint is edge-placed because it spreads quickly.",
  "metrics": {
    "utilization": 100,
    "stockoutRisk": "low",
    "expectedRevenue": 12400,
    "seedlingCapacityRisk": "medium"
  },
  "layout": [
    {
      "plant": "lettuce",
      "zone": "LZ1",
      "gridRange": "A1-D5",
      "reasonTags": ["target_crop", "medium_light", "high_water"]
    },
    {
      "plant": "basil",
      "zone": "LZ2",
      "gridRange": "I7-J10",
      "reasonTags": ["reserve_crop", "high_light", "medium_water"]
    },
    {
      "plant": "mint",
      "zone": "edge",
      "gridRange": "E1-E4",
      "reasonTags": ["spreading_growth", "edge_placement", "high_water"]
    }
  ],
  "nurserySchedule": [
    {
      "crop": "lettuce",
      "seedWeek": 1,
      "transplantWeek": 3,
      "seedlings": 1278,
      "status": "stagger_required",
      "reasonTags": ["target_crop", "reserve_15", "nursery_capacity_check"]
    },
    {
      "crop": "basil",
      "seedWeek": 1,
      "transplantWeek": 3,
      "seedlings": 1800,
      "status": "stagger_required",
      "reasonTags": ["reserve_20", "nursery_capacity_check"]
    },
    {
      "crop": "mint",
      "seedWeek": 1,
      "transplantWeek": 3,
      "seedlings": 2124,
      "status": "stagger_required",
      "reasonTags": ["reserve_18", "nursery_capacity_check"]
    }
  ],
  "warnings": [
    "Mint is edge-placed because it can spread quickly.",
    "Seedling demand exceeds nursery capacity, so batches should be staggered before transplant."
  ]
}
```

## Page 6: Confirm Plan

Purpose:

Let the user review and confirm the generated plan before entering the live dashboard.

Main UI:

- Wizard sidebar progress
- KPI cards:
  - Utilization
  - Expected revenue
  - Stockout risk
  - Re-plan suggested status
- Farm grid
- 8-week plan timeline
- Seedling and transplant timeline
- Nursery capacity warning, if any
- Copilot preview card with template copy only
- CTA: Confirm & Start

Important:

- Do not run the interactive Copilot on this page.
- The Copilot card can show template text such as "This plan aligns crop needs with farm constraints."
- The interactive template Copilot starts on Dashboard / Re-plan.

## Page 7: Dashboard / Re-plan

Purpose:

Show the confirmed plan in an operating dashboard and let the user interact with the template Copilot.

Main UI:

- KPI cards
- Farm grid
- Crop mix summary
- Live sensor snapshot
- Nursery queue
- Ready-to-transplant batch summary
- Next seeding batch
- Seedling capacity risk
- 8-week plan
- Sensor/status panel
- Risk or incident panel
- Template Copilot chat
- Re-plan buttons:
  - Explain risk
  - Show alternatives
  - Apply re-plan

Recommended incident:

```text
Lettuce growth delayed by 5 days
```

Dashboard behavior:

1. Show the confirmed plan.
2. User clicks a pre-defined why/re-plan prompt or scenario button.
3. App selects the matching template response using farm setup, selected crops, goal, generated plan JSON, nursery schedule, reason tags, and current incident state.
4. If the question requires changed positions, convert the user request into structured constraints and re-run the rule/layout engine.
5. Template Copilot explains the existing or updated plan.

Recommended demo Copilot implementation:

```text
Pre-defined prompt chips + plan-aware template responses
```

Template response guardrails:

```text
You are AgriMatrix Copilot.
Use only the provided farm setup, crop attributes, goal, generated plan, nursery schedule, reason tags, and current incident.
Do not invent plant facts.
Do not change plant positions unless the app provides an updated plan.
Explain briefly in friendly, operator-focused language.
When asked to re-plan, describe the trade-off and refer to the updated layout returned by the rule engine.
```

Optional production upgrade:

```text
After the demo, the same Copilot contract can be upgraded to a live LLM.
The LLM should still receive only the structured plan context and should never become the source of truth for plant positions.
```

Example template Copilot response:

```text
Lettuce is placed in A1-D5 because it is the target crop and needs the most consistent light and water zones.
Basil is reserved separately to protect the 20% buffer, while Mint is kept near the edge because it spreads quickly.
The seedling schedule starts two weeks before transplant so the nursery queue is ready before the grid changes.
```

Example template re-plan response:

```text
Because Lettuce is delayed by 5 days, the updated plan uses Basil reserve space more conservatively and keeps Mint isolated.
This reduces short-term stockout risk while keeping utilization above 90%.
```

## Demo Script

1. Open AgriMatrix.
2. Show the Welcome page and click Start Demo.
3. Confirm Setup Farm defaults: GreenRise Farm, 10 x 12 grid, 3 lighting zones, 2 irrigation zones, 240 seedling nursery capacity.
4. Select Lettuce, Basil, and Mint.
5. Define per-crop goals and reserve, then show estimated seedlings per week.
6. Generate Plan.
7. Show draft grid allocation, nursery schedule, timeline, utilization, and stockout risk.
8. Confirm Plan.
9. Land on Dashboard.
10. Point out nursery queue, ready-to-transplant batch, and next seeding batch.
11. Click Copilot prompt: Why is Mint placed at the edge?
12. Simulate Lettuce delay +5 days.
13. Show template re-plan explanation and updated plan suggestion.

Opening line:

```text
AgriMatrix turns farm setup, nursery capacity, crop choices, and production goals into a planting plan operators can actually use.
```

Closing line:

```text
The wizard keeps planting and seedling schedules stable, and the dashboard Copilot makes the confirmed plan explainable and adaptable.
```

## Two-Day Build Plan

Day 1:

- Build Welcome page
- Build Setup Farm UI
- Build Select Crops UI
- Build Define Goal UI
- Create plant attribute JSON
- Create deterministic rule/layout engine
- Generate plan JSON and metrics
- Add seedling estimate and nursery capacity logic

Day 2:

- Build Generate Plan UI
- Build Confirm Plan UI
- Build Dashboard / Re-plan UI
- Add pre-defined Copilot prompts and template responses in Dashboard
- Keep optional LLM integration as a post-demo upgrade
- Test all 15 non-empty crop combinations
- Polish demo script and UI states

## Success Criteria

The demo should make these points obvious:

- The flow matches the mockups: Setup Farm, Select Crops, Define Goal, Generate Plan, Confirm Plan.
- User can select any non-empty combination of 4 crops.
- Every valid selection generates a deterministic plan.
- The confirmed plan includes actual plant positions, metrics, and timeline.
- The confirmed plan includes nursery schedule, transplant timing, and seedling capacity risk.
- The template Copilot appears in Dashboard / Re-plan only.
- Copilot explanations stay consistent with the plan because the rule/layout engine remains the source of truth.

## Deployment Note

Current shared preview:

- Vercel preview is available for team review
- URL: `https://agrimatrix-demo.vercel.app`

## Nice-to-Have Features

If time allows:

- Thai/English language toggle
- Show reason tags as developer/debug mode
- Save generated plan to local storage
- Toggle between grid view and pot view
- Add downloadable PDF or CSV plan export
