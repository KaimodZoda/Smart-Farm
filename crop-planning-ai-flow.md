# AI Crop Planning Flow for Controlled Environment Farming

## Product Concept

An AI-assisted planning system for closed-environment farming that helps operators decide what to plant, where to plant it, and when to harvest. The system optimizes crop schedules across farm grids to maximize space utilization, yield, revenue, and delivery reliability.

## Real User Flow

### 1. Farm Setup

The user configures the basic farm structure:

- Greenhouse or room size
- Rack, shelf, and grid layout
- Growing system, such as hydroponic, vertical farm, or NFT
- Capacity of each grid
- Available sensors, such as temperature, humidity, pH, EC, and light
- Cost assumptions, such as electricity, water, fertilizer, and labor
- Crops that can be grown in the farm

Outcome: the system understands the farm capacity and operational constraints.

### 2. Crop Profile Setup

The user selects crops from a crop library or creates custom crop profiles:

- Growth duration
- Nursery, grow, and harvest stages
- Yield per grid
- Required spacing
- Ideal temperature, humidity, light, pH, and EC range
- Expected selling price
- Estimated demand

AI can suggest default crop values, but the user should be able to edit them.

### 3. Production Goal Input

The user defines the production objective, for example:

- Deliver 50 kg of lettuce every Friday
- Maximize monthly profit
- Reduce unused grid time
- Reduce electricity cost during peak hours
- Reserve 20% of the farm for basil

The user can enter goals through a structured form or by chatting with the AI copilot in natural language.

### 4. AI Plan Generation

The AI planner generates a planting plan that specifies:

- Which crop should be planted in each grid
- When to seed
- When to transplant
- When to harvest
- Expected yield
- Space utilization
- Expected revenue and cost

The plan should be shown in two main views:

- Calendar view for timeline and harvest planning
- Grid view for physical farm allocation

### 5. Human Review and Adjustment

The user reviews and modifies the plan if needed:

- Lock a grid for a specific crop
- Move a harvest date
- Add or remove a crop
- Disable a zone that is under maintenance
- Change the optimization goal from profit to stable supply

After each change, the system re-optimizes only the affected parts of the plan.

### 6. Plan Execution

Once the user confirms the plan, the system converts it into daily operational tasks:

- Seed lettuce batch A today
- Move basil batch B to shelf 2
- Check pH in zone C
- Prepare kale harvest for Friday

Tasks can be sent through a dashboard, mobile app, Microsoft Teams, LINE, or email notification.

### 7. Monitoring During Growth

The system monitors actual farm conditions through sensors or manual updates:

- Temperature is higher than expected
- pH is outside the ideal range
- Crop growth is slower than forecast
- A shelf becomes available earlier than expected
- Customer demand increases

The system continuously compares actual conditions against the original plan.

### 8. Alert and Re-plan

When a deviation occurs, the AI suggests corrective actions:

- Lettuce batch A is likely to be delayed by 4 days
- Move basil to grids C4-C8 to maintain utilization
- Harvest batch B earlier to meet Friday demand
- Start a backup lettuce batch to reduce stockout risk

The user can accept the recommendation or manually adjust the revised plan.

### 9. Harvest and Record

At harvest time, the user records:

- Actual harvest date
- Actual weight
- Product quality
- Loss or waste
- Actual revenue

This creates a feedback loop for improving future planning.

### 10. Learning Loop

The system learns farm-specific patterns over time:

- Lettuce usually takes 38 days in this farm, not 35
- Upper shelves grow more slowly than middle shelves
- Basil yield improves under specific temperature conditions
- Zone C often has humidity issues

Future plans become more accurate because the AI adapts to the farm's real operating conditions.

## End-to-End Journey

```text
Setup Farm
-> Select Crops
-> Define Production Goal
-> AI Generates Planting Plan
-> Human Reviews and Adjusts
-> Confirm Plan
-> Daily Task Execution
-> Sensor or Manual Monitoring
-> AI Detects Deviation
-> Re-plan
-> Harvest Record
-> Improve Next Plan
```

## Suggested Hackathon Demo Flow

1. Farmer logs in and sees an empty 10x10 farm grid.
2. Farmer asks the AI: "This month I need to deliver 200 kg of lettuce per week and reserve 20% of the farm for basil."
3. AI generates an 8-week planting plan with grid allocation and calendar schedule.
4. Farmer clicks a batch and asks: "Why did you plant this here?"
5. AI explains the decision based on harvest window, expected yield, demand, and available space.
6. Farmer simulates an incident: "Lettuce growth is delayed by 5 days."
7. The system detects delivery risk and generates a revised plan.
8. Dashboard shows improved utilization, lower stockout risk, and expected revenue.

## Core Value Proposition

Traditional farm planning often depends on spreadsheets and operator experience. This system turns crop planning into an AI-assisted operating system for closed-environment farms, combining optimization, real-time monitoring, and adaptive re-planning.

