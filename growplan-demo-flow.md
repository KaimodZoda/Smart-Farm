# GrowPlan AI Demo Flow

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

- Done: Welcome -> Setup Farm -> Select Crops -> Define Goal -> Generate Plan
- Next: Confirm Plan -> Dashboard / Re-plan

The wizard should feel stable and deterministic. The LLM response should appear only in the Dashboard / Re-plan experience, after the system has already generated and confirmed a plan.

## Core Product Idea

GrowPlan AI helps a controlled-farm operator turn farm setup, selected crops, and production goals into an actionable planting layout. The planning flow creates the plan with deterministic rules. The AI Copilot then explains the confirmed plan and supports re-planning when constraints change.

Main message:

> GrowPlan AI creates a clear planting plan first, then lets operators ask why the plan works or how to adapt it when real conditions change.

## LLM Scope

Use the LLM only in the Dashboard / Re-plan page.

Do not call the LLM during:

- Setup Farm
- Select Crops
- Define Goal
- Generate Plan
- Confirm Plan

Those pages should use local state, deterministic rule/layout logic, and template copy so the demo remains fast and reliable.

Use the LLM for:

- Why this layout?
- Explain risk
- Show alternatives
- What if I only have 2 pots?
- What if I can water only every other day?
- Incident response, such as lettuce delayed by 5 days

## Source of Truth

The rule/layout engine is the source of truth.

The LLM should receive:

- Farm setup
- Selected crop attributes
- Defined goal
- Generated plan JSON
- Reason tags from the rule/layout engine
- Current dashboard incident or user question

The LLM should not invent a new layout. If re-planning is needed, the app should convert the request into structured constraints, run the rule/layout engine again, and then let the LLM explain the updated plan.

## Recommended Tech Stack

- Vite
- React
- TypeScript
- Plain CSS or CSS modules
- lucide-react for icons
- Mock rule/layout engine in frontend
- Gemini 2.5 Flash for Dashboard / Re-plan explanation
- Template fallback if the LLM API fails or hits a rate limit

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

## Page 1: Welcome / Start

Purpose:

Introduce GrowPlan AI and start the demo.

Main UI:

- Product name: GrowPlan AI
- Headline: Smart planting layouts for controlled farms
- Subheadline: Set up your farm, choose crops, generate a plan, then use AI to explain and re-plan after confirmation.
- Primary CTA: Start Demo
- Visual preview:
  - Farm grid preview
  - Planting timeline preview
  - KPI preview

User action:

- Click Start Demo

## Page 2: Setup Farm

Purpose:

Capture the growing space before the user chooses crops.

Main UI:

- Wizard sidebar progress
- Farm name
- Farm location
- Farm layout rows
- Farm layout columns
- Total grids
- Lighting zones
- Irrigation zones
- Growing system
- Farm layout preview
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
Basil + Chili + Mint
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
  - Forecasting harvest schedule
- Draft plan preview
- Mini grid allocation
- Mini harvest timeline
- KPI preview
- CTA: View Draft Plan

Behavior:

- Show staged generation progress UI and draft preview.
- Generate a deterministic draft plan preview from farm setup, selected crops, and per-crop goals.
- Do not call the LLM here.

## Mock Rule/Layout Engine

The engine should be deterministic enough to feel credible but simple enough for a hackathon PoC.

Inputs:

- Farm setup
- Selected crops
- Defined goal
- Optional structured constraints from re-plan

Basic rules:

```text
If crops have similar light needs:
  place them in compatible lighting zones

If crops have similar water needs:
  place them in compatible irrigation zones

If a crop has aggressive or spreading growth:
  place it on an edge or isolate it when possible

If there is a reserve crop:
  allocate the reserve percentage first

If the priority is maximize utilization:
  fill more grids and keep only a small buffer

If the priority is minimize stockout risk:
  allocate more space to the target crop
```

Example generated plan JSON:

```json
{
  "planId": "greenrise-lettuce-basil-mint-8w",
  "summary": "Lettuce receives the main production zone, Basil is reserved at 20%, and Mint is edge-placed because it spreads quickly.",
  "metrics": {
    "utilization": 94,
    "stockoutRisk": "low",
    "expectedRevenue": 12400
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
  "warnings": [
    "Mint is edge-placed because it can spread quickly."
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
- AI Copilot preview card with template copy only
- CTA: Confirm & Start

Important:

- Do not call the LLM on this page.
- The AI Copilot card can show template text such as "This plan aligns crop needs with farm constraints."
- The real interactive AI Copilot starts on Dashboard / Re-plan.

## Page 7: Dashboard / Re-plan

Purpose:

Show the confirmed plan in an operating dashboard and let the user interact with the AI Copilot.

Main UI:

- KPI cards
- Farm grid
- 8-week plan
- Sensor/status panel
- Risk or incident panel
- AI Copilot chat
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
2. User asks a why/re-plan question or clicks a scenario button.
3. App sends farm setup, selected crops, goal, generated plan JSON, reason tags, and user question to the LLM.
4. If the question requires changed positions, convert the user request into structured constraints and re-run the rule/layout engine.
5. LLM explains the existing or updated plan.

Recommended LLM model:

```text
Gemini 2.5 Flash
```

Prompt guardrails:

```text
You are GrowPlan AI Copilot.
Use only the provided farm setup, crop attributes, goal, generated plan, reason tags, and current incident.
Do not invent plant facts.
Do not change plant positions unless the app provides an updated plan.
Explain briefly in friendly, operator-focused language.
When asked to re-plan, describe the trade-off and refer to the updated layout returned by the rule engine.
```

Example AI Copilot response:

```text
Lettuce is placed in A1-D5 because it is the target crop and needs the most consistent light and water zones.
Basil is reserved separately to protect the 20% buffer, while Mint is kept near the edge because it spreads quickly.
```

Example re-plan response:

```text
Because Lettuce is delayed by 5 days, the updated plan uses Basil reserve space more conservatively and keeps Mint isolated.
This reduces short-term stockout risk while keeping utilization above 90%.
```

## Demo Script

1. Open GrowPlan AI.
2. Show the Welcome page and click Start Demo.
3. Confirm Setup Farm defaults: GreenRise Farm, 10 x 12 grid, 3 lighting zones, 2 irrigation zones.
4. Select Lettuce, Basil, and Mint.
5. Define per-crop goals and reserve, then set 8-week horizon.
6. Generate Plan.
7. Show draft grid allocation, timeline, utilization, and stockout risk.
8. Confirm Plan.
9. Land on Dashboard.
10. Ask AI Copilot: Why is Mint placed at the edge?
11. Simulate Lettuce delay +5 days.
12. Show AI re-plan explanation and updated plan suggestion.

Opening line:

```text
GrowPlan AI turns farm setup, crop choices, and production goals into a planting plan operators can actually use.
```

Closing line:

```text
The wizard keeps planning stable, and the dashboard AI makes the confirmed plan explainable and adaptable.
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

Day 2:

- Build Generate Plan UI
- Build Confirm Plan UI
- Build Dashboard / Re-plan UI
- Add Gemini 2.5 Flash only in Dashboard AI Copilot
- Add template fallback if LLM fails
- Test all 15 non-empty crop combinations
- Polish demo script and UI states

## Success Criteria

The demo should make these points obvious:

- The flow matches the mockups: Setup Farm, Select Crops, Define Goal, Generate Plan, Confirm Plan.
- User can select any non-empty combination of 4 crops.
- Every valid selection generates a deterministic plan.
- The confirmed plan includes actual plant positions, metrics, and timeline.
- The LLM appears in Dashboard / Re-plan only.
- AI explanation stays consistent with the plan because the rule/layout engine remains the source of truth.

## Nice-to-Have Features

If time allows:

- Thai/English language toggle
- Show reason tags as developer/debug mode
- Save generated plan to local storage
- Toggle between grid view and pot view
- Add downloadable PDF or CSV plan export
