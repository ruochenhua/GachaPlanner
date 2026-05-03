## ADDED Requirements

### Requirement: System detects resource conflicts across games
The system SHALL automatically detect when multiple game goals have an achievement probability below the conflict threshold (80%). When detected, the system MUST display a conflict alert with actionable guidance.

#### Scenario: Conflict detected on overview load
- **GIVEN** the user has goals for 2 games
- **AND** both games have achievement probability < 80%
- **WHEN** the overview page loads
- **THEN** a conflict alert card is displayed prominently
- **AND** the alert explains which games are in conflict

#### Scenario: Conflict resolved after simulation
- **GIVEN** a conflict alert is currently displayed
- **WHEN** user adjusts allocation in the simulator
- **AND** all games now have probability ≥ 80%
- **THEN** the conflict alert is automatically hidden

#### Scenario: Dismissing conflict alert
- **WHEN** user taps "暂不处理" text link on the conflict alert
- **THEN** the alert is hidden for the current session
- **AND** will reappear on next page load if the conflict persists

#### Scenario: Taking action on conflict alert
- **WHEN** user taps "帮我算一下怎么分配" primary button on the conflict alert
- **THEN** the resource allocation simulator expands automatically
- **AND** the user can adjust allocations to resolve the conflict

#### Scenario: No conflict exists
- **GIVEN** the user has goals for multiple games
- **AND** at least one game has probability ≥ 80%
- **WHEN** the overview page loads
- **THEN** no conflict alert is displayed
