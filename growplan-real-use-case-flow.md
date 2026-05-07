# AgriMatrix Real Use Case Flow

## Purpose

This document describes how AgriMatrix should work in a real plant factory deployment, beyond the hackathon demo flow.

The real product should separate farm infrastructure data from crop recipe data:

- Farm setup defines the physical room structure and operational capacity of the farm.
- Crop recipes define crop-specific growing assumptions such as seedling lead time, grow duration, yield, spacing, EC, pH, fertilizer ratio, light, and harvest rules.
- The planner combines both sources with business goals to generate a planting plan, nursery schedule, daily work schedule, monitoring alerts, and re-plans.

## Core Principle

AgriMatrix should not ask the operator for crop-specific growing assumptions before the crop is selected.

For example:

- `Nursery capacity` belongs in Farm Setup because it is a physical farm resource.
- `Seedling lead time` belongs in Crop Recipe because it differs by crop and variety.
- `EC / pH / fertilizer ratio / light / spacing / yield` belong in Crop Recipe.
- `Room weather profile` belongs in Farm Setup because real plant factories often manage growing environments room by room.
- Farm-specific overrides can adjust recipes after selection, but the starting point should come from a central recipe database.

## Recommended Data Model

### 1. Farm Profile

Farm Profile describes infrastructure and operational limits.

Example fields:

- Farm name
- Location
- Growing system, such as NFT, DWC, substrate, vertical rack, or greenhouse
- Rooms, racks, shelves, rows, columns, and grid capacity
- Weather profile per room, such as temperature, humidity, CO2, airflow, and light schedule
- Nursery tray count
- Nursery capacity in seedlings
- Sensor availability
- Labor shifts
- Maintenance windows

Example JSON:

```json
{
  "farmId": "farm_greenrise_bkk",
  "farmName": "GreenRise Farm",
  "location": "Bangkok",
  "growingSystem": "Hydroponic NFT",
  "rooms": [
    {
      "roomId": "room_a",
      "name": "Grow Room A",
      "rows": 5,
      "columns": 12,
      "totalCells": 60,
      "weatherProfile": {
        "temperatureC": {
          "day": 24,
          "night": 20
        },
        "humidityPercent": 65,
        "co2Ppm": 800,
        "lightHoursPerDay": 16,
        "airflow": "Medium"
      }
    },
    {
      "roomId": "room_b",
      "name": "Grow Room B",
      "rows": 5,
      "columns": 12,
      "totalCells": 60,
      "weatherProfile": {
        "temperatureC": {
          "day": 22,
          "night": 19
        },
        "humidityPercent": 70,
        "co2Ppm": 750,
        "lightHoursPerDay": 14,
        "airflow": "Medium"
      }
    }
  ],
  "nursery": {
    "trayCount": 12,
    "capacitySeedlings": 240
  }
}
```

### 2. Crop Recipe

Crop Recipe describes crop-specific growing rules.

The default recipe should come from a central recipe database. The user can later customize it for their farm.

Example fields:

- Crop name
- Variety
- Seedling lead time
- Transplant-to-harvest duration
- Total grow duration
- Yield per plant
- Yield per grid
- Plant spacing
- EC range
- pH range
- Fertilizer ratio
- Temperature range
- Humidity range
- Light requirement
- Water requirement
- Harvest method
- Risk notes

Example JSON:

```json
{
  "recipeId": "lettuce_butterhead_default",
  "cropId": "lettuce",
  "cropName": "Lettuce",
  "variety": "Butterhead",
  "source": "AgriMatrix central recipe database",
  "seedlingLeadDays": 14,
  "transplantToHarvestDays": 28,
  "yieldKgPerPlant": 0.18,
  "plantsPerGrid": 1,
  "ecRange": {
    "min": 1.2,
    "max": 1.8,
    "unit": "mS/cm"
  },
  "phRange": {
    "min": 5.8,
    "max": 6.4
  },
  "fertilizerRatio": {
    "stockA": 2,
    "stockB": 2,
    "calcium": 1,
    "magnesium": 0.5,
    "unit": "ml/L"
  },
  "lightRequirement": "Medium",
  "waterRequirement": "High",
  "riskNotes": [
    "Sensitive to heat stress",
    "Monitor tip burn risk under high EC"
  ]
}
```

### 3. Farm Recipe Override

In real deployments, default crop recipes should be editable per farm because every plant factory behaves differently.

Example:

- Central recipe says lettuce seedling lead time is 14 days.
- GreenRise Farm usually needs 16 days because nursery temperature is slightly lower.
- The system stores an override for that farm without changing the global recipe.

Example JSON:

```json
{
  "farmId": "farm_greenrise_bkk",
  "baseRecipeId": "lettuce_butterhead_default",
  "overrides": {
    "seedlingLeadDays": 16,
    "yieldKgPerPlant": 0.17
  },
  "reason": "Observed from last 6 harvest cycles"
}
```

## Real User Journey

```text
Welcome / Login
-> Farm Setup
-> Recipe Library
-> Select Crops
-> Define Production Goal
-> Generate Plan
-> Confirm Plan
-> Dashboard
-> Work Schedule
-> Monitoring
-> Alert / Re-plan
-> Harvest Record
-> Recipe Learning Loop
```

## Page 1: Welcome / Login

Purpose:

Route the user by role and workspace.

Main roles:

- Owner / Manager
- Supervisor
- Employee
- Agronomist / Recipe Admin

Main actions:

- Continue to farm dashboard
- Create or edit farm setup
- Open daily work schedule
- Manage crop recipes

## Page 2: Farm Setup

Purpose:

Capture farm infrastructure only.

This page should not ask for crop-specific growing assumptions because the user may not have selected crops yet.

Main UI:

- Farm name
- Location
- Growing system
- Room list
- Room weather profile
- Rack / shelf / grid layout per room
- Nursery tray count
- Nursery capacity
- Sensor setup
- Labor shift setup

Important note:

`Nursery capacity` remains here because it is a farm resource. `Seedling lead time` should move out of this page and come from selected crop recipes.

Real plant factory assumption:

Instead of asking the user to create generic lighting or irrigation zones, the product should model the farm as multiple rooms. Each room can have its own controlled weather profile and layout.

Example rooms:

```text
Room A
- Temperature: 24C day / 20C night
- Humidity: 65%
- CO2: 800 ppm
- Light: 16 hours / day
- Layout: 5 x 12 grid

Room B
- Temperature: 22C day / 19C night
- Humidity: 70%
- CO2: 750 ppm
- Light: 14 hours / day
- Layout: 5 x 12 grid
```

Output:

- Farm capacity
- Physical layout
- Nursery limit
- Room-level weather constraints
- Room-level capacity constraints

## Page 3: Recipe Library

Purpose:

Provide a trusted source of crop assumptions.

For the default product experience, AgriMatrix should assume recipes come from a central recipe database.

Main UI:

- Search crop
- Filter by category, growing system, and climate
- View recipe details
- Compare varieties
- Duplicate central recipe into farm-specific recipe
- Import recipe
- Export recipe

Recipe detail should include:

- Seedling days
- Grow days
- Yield
- Spacing
- EC / pH
- Fertilizer ratio
- Temperature / humidity
- Light and water requirement
- Harvest rules
- Known risks

Recommended product positioning:

> AgriMatrix starts with a central crop recipe database, then learns and adapts recipes to each farm over time.

## Page 4: Select Crops

Purpose:

Let the manager choose crops or varieties for the next planning cycle.

When the user selects a crop, the system should load the matching recipe automatically.

Main UI:

- Crop cards
- Recipe summary on each crop card
- Recipe source indicator:
  - Central default
  - Farm override
  - Imported recipe
  - Learned recipe
- Warning badges, such as high water demand or spreading behavior

Example crop card:

```text
Lettuce / Butterhead
Seedling: 14 days
Grow: 28 days after transplant
Yield: 0.18 kg / plant
EC: 1.2 - 1.8 mS/cm
Fertilizer: Stock A:B 1:1, Ca 1 ml/L, Mg 0.5 ml/L
Source: Central recipe
```

Output:

- Selected crops
- Selected recipe per crop
- Any farm-specific overrides

## Page 5: Define Production Goal

Purpose:

Translate business demand into production targets.

Main UI:

- Goal per crop per week
- Reserve percentage
- Planning horizon
- Optimization priority
- Capacity preview
- Nursery pressure preview
- Room suitability preview

The system should use crop recipes to calculate:

- Estimated plants needed per week
- Estimated seedlings needed per week
- Required nursery space over time
- Harvest timing
- Grid demand
- Expected yield
- Best-fit rooms based on recipe weather requirements

This page should not ask the user to estimate seedlings manually. It should explain how the number was derived from recipe data.

## Page 6: Generate Plan

Purpose:

Generate an optimized planting and nursery schedule.

Inputs:

- Farm profile
- Selected crops
- Crop recipes
- Farm recipe overrides
- Room weather profiles
- Production goals
- Current farm state
- Existing batches
- Labor availability
- Maintenance windows

Planner outputs:

- Room and grid allocation
- Nursery schedule
- Seed dates
- Transplant dates
- Harvest dates
- Expected yield
- Nutrient / fertilizer preparation tasks
- Capacity risk
- Stockout risk
- Work schedule tasks
- Explanation tags

Planner logic should match crops to rooms by comparing recipe requirements against room weather profiles. For example, lettuce can be prioritized into a cooler room, while basil can be placed in a warmer room if both rooms have available capacity.

## Page 7: Confirm Plan

Purpose:

Let the manager review and approve the plan before execution.

Main UI:

- Room/grid view
- Timeline view
- Nursery queue
- Recipe assumptions used
- Capacity warnings
- Risk summary
- Confirm button

Important UX:

The user should be able to inspect which recipe values affected the plan. For example:

```text
Lettuce schedule uses:
- Seedling lead time: 14 days
- Transplant-to-harvest: 28 days
- Yield: 0.18 kg / plant
- EC target: 1.2 - 1.8 mS/cm
- Fertilizer ratio: Stock A:B 1:1, Ca 1 ml/L, Mg 0.5 ml/L
- Room match: Grow Room B, 22C day / 19C night, 70% humidity
```

## Page 8: Dashboard

Purpose:

Monitor the active plan and operational state.

Main UI:

- Utilization
- Expected harvest
- Nursery pressure
- Stockout risk
- Sensor risk
- Crop health alerts
- Copilot explanation
- Work Schedule tab
- Re-plan action

The dashboard should compare:

- Planned state
- Actual sensor data
- Manual staff updates
- Harvest records
- Crop recipe expectations
- Room weather targets

## Page 9: Work Schedule

Purpose:

Turn the plan into daily work instructions for employees.

Manager view:

- Team progress
- Task assignment
- Pending tasks by person
- High priority tasks
- Task reason and recipe basis

Employee view:

- Daily checklist
- Task details
- Room, rack, grid, and batch location
- Exact instructions
- Done criteria
- Ability to check off completed tasks

Task examples:

```text
Seed 120 lettuce seedlings
Recipe basis: Lettuce seedling lead time is 14 days.
Instruction: Prepare 120 cells, place 1 seed per cell, mist evenly, and label batch L-W03.
Done when: 120 cells are seeded, labeled, and placed on Nursery Rack A.
```

```text
Adjust EC in Room A
Recipe basis: Lettuce EC target is 1.2 - 1.8 mS/cm.
Instruction: Measure EC, dilute if above range, add nutrient mix if below range, re-check after 15 minutes.
Done when: EC is stable within target range.
```

```text
Mix lettuce nutrient solution for Room B
Recipe basis: Lettuce fertilizer ratio is Stock A:B 1:1, Ca 1 ml/L, Mg 0.5 ml/L.
Instruction: Prepare nutrient tank for Room B using the recipe ratio, then verify EC and pH before circulation.
Done when: Tank mix is recorded, EC is within range, and pH is within 5.8 - 6.4.
```

## Page 10: Monitoring And Alert

Purpose:

Detect deviations between plan, crop recipe expectations, and actual farm state.

Inputs:

- Sensor data
- Manual staff checklist
- Crop health observations
- Actual growth progress
- Harvest records

Alert examples:

- Suspected disease in Room B
- EC outside crop recipe range
- Fertilizer mix does not match recipe ratio
- Room humidity is outside crop recipe range
- Nursery capacity will exceed safe limit in 6 days
- Lettuce growth is 4 days slower than recipe expectation
- Demand increased beyond planned harvest volume

## Page 11: Re-plan

Purpose:

Convert incidents into structured constraints and generate a revised plan.

Example:

```text
Incident:
Suspected disease in Lettuce Room B.

Structured constraints:
- Isolate Room B for 7 days
- Do not assign new transplants to Room B
- Pull harvest forecast down by 8 trays
- Increase reserve batch if nursery capacity allows
```

Re-plan output:

- Revised room and grid allocation
- Revised nursery schedule
- Revised work schedule
- Expected recovery date
- Risk comparison against original plan

## Page 12: Harvest Record

Purpose:

Close the loop between planned yield and actual yield.

Main UI:

- Batch harvested
- Actual harvest date
- Actual weight
- Quality grade
- Waste / loss
- Notes

This data should feed future planning and recipe learning.

## Page 13: Recipe Learning Loop

Purpose:

Improve planning accuracy over time.

The system should compare actual farm outcomes against recipe assumptions.

Examples:

- Lettuce at GreenRise Farm averages 16 seedling days, not 14.
- Basil yield is 8% higher in warmer rooms.
- Mint spreads faster in high humidity rooms.
- EC drift in Room A causes slower growth.
- Lettuce performs better when Room B humidity stays near 68%.

The system can then suggest:

- Update farm-specific recipe override
- Keep central recipe unchanged
- Apply room-specific adjustment
- Flag data as insufficient and keep monitoring

## Import / Export Strategy

Import and export are useful, but they should not be required for the starting product experience.

Recommended approach:

1. Default: central AgriMatrix recipe database
2. Next: farm-specific recipe overrides
3. Later: import / export recipes for advanced users and enterprise deployments

Import use cases:

- Existing farm has crop data in spreadsheets
- Agronomist wants to upload custom variety recipes
- Enterprise customer wants to migrate historical recipe data
- Enterprise customer wants to migrate room-level climate profiles

Export use cases:

- Backup farm-specific recipes
- Share recipes across farm branches
- Review recipe assumptions with agronomists
- Audit why a plan was generated
- Share room-level weather assumptions with an agronomist or operations team

Supported formats later:

- CSV
- XLSX
- JSON

## Product Recommendation

For the real use case, AgriMatrix should assume there is a central crop recipe database from day one.

This makes the UX cleaner because the manager does not need to know every crop parameter before planning. The product feels more intelligent when selecting a crop automatically brings in lead time, yield, EC, pH, fertilizer ratio, spacing, and risk assumptions.

The farm model should use rooms as the main environment unit. Each room has its own weather profile, and the planner should match crop recipes to rooms based on suitability.

The best product story is:

> AgriMatrix starts from proven crop recipes, adapts them to your farm, and turns them into plans your team can execute.

## Difference From Hackathon Demo Flow

| Topic | Demo Flow | Real Use Case Flow |
|---|---|---|
| Recipe source | Hardcoded frontend crop constants | Central recipe database |
| Nursery capacity | Setup Farm | Setup Farm |
| Seedling lead time | Setup Farm | Crop Recipe |
| Farm environment | Lighting / irrigation zones | Multiple rooms with weather profiles |
| Crop parameters | Simple crop catalog | Recipe Library + farm overrides |
| Fertilizer ratio | Not modeled | Crop Recipe |
| Copilot | Template responses | Plan-aware assistant with structured tool calls |
| Work schedule | Generated demo tasks | Role-based execution system |
| Monitoring | Simulated incident | Sensor + manual updates |
| Re-plan | Deterministic scenario | Constraint-based re-optimization |
| Learning | Not required | Harvest feedback updates farm recipe overrides |

## Implementation Direction After Demo

Recommended next product increments:

1. Move crop-specific values into recipe data.
2. Add recipe summary to Select Crops.
3. Remove global seedling lead time from Setup Farm.
4. Keep nursery capacity in Setup Farm.
5. Replace generic lighting / irrigation zones with room-level setup.
6. Add weather profile per room.
7. Add fertilizer ratio to crop recipe data.
8. Store selected recipe IDs in planning state.
9. Show recipe and room assumptions in Confirm Plan.
10. Use recipe values in task details.
11. Add farm-specific recipe override support.
12. Add import / export after the recipe model is stable.
