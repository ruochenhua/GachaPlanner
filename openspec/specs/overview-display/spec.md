## MODIFIED Requirements

### Requirement: Overview page displays multi-game resource summary
The overview page SHALL display a summary of all games' resources and achievement status. This requirement is modified to include goal-based display in addition to resource-based display.

#### Scenario: Overview with goals
- **WHEN** user opens the overview page
- **AND** goals exist for at least one game
- **THEN** the page displays goal cards for each game with a goal
- **AND** shows the resource allocation simulator
- **AND** shows strategy suggestions
- **AND** shows conflict alerts if applicable

#### Scenario: Overview without goals (fallback)
- **WHEN** user opens the overview page
- **AND** no goals exist
- **THEN** the page displays the existing resource summary cards
- **AND** shows a prompt encouraging the user to set goals
- **AND** the simulator and strategy sections are hidden

## ADDED Requirements

### Requirement: Overview page serves as the primary entry point
The overview page SHALL be the first tab in the TabBar, reinforcing its role as the primary entry point for the app's core value proposition.

#### Scenario: App launch
- **WHEN** user opens the app
- **THEN** the overview page is displayed by default
- **AND** the "Overview" tab is active in the TabBar
