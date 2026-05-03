## ADDED Requirements

### Requirement: System generates strategy options for resource allocation
The system SHALL automatically generate 2-3 strategy options based on the current resource allocation and goals. Each option MUST include a name, resource allocation per game, resulting probabilities, a human-readable conclusion, and a one-tap apply action.

#### Scenario: Generating strategies on overview load
- **WHEN** the overview page loads
- **AND** at least one goal exists
- **THEN** the system generates strategy options
- **AND** displays them in the strategy section

#### Scenario: Previewing a strategy
- **GIVEN** the user is viewing strategy options
- **WHEN** user taps "预览效果" on a strategy card
- **THEN** the simulator temporarily applies the strategy's resource allocation
- **AND** the allocation bars highlight to indicate preview mode
- **AND** a banner shows "当前为预览，点击确认采用或取消"
- **AND** the user can see the effect before committing

#### Scenario: Confirming a strategy after preview
- **GIVEN** the user is previewing a strategy
- **WHEN** user taps "确认采用此方案"
- **THEN** the system saves the strategy's resource allocation to storage
- **AND** the simulator exits preview mode
- **AND** the overview page refreshes with the new data

#### Scenario: Canceling a strategy preview
- **GIVEN** the user is previewing a strategy
- **WHEN** user taps "取消预览"
- **THEN** the simulator reverts to the original resource allocation
- **AND** the overview page returns to the pre-preview state

#### Scenario: Strategy with budget recommendation
- **GIVEN** no strategy can achieve acceptable probability with current resources
- **WHEN** the system generates strategies
- **THEN** one option MUST include a recommended top-up amount
- **AND** show the projected probabilities with the additional budget

#### Scenario: No goals set
- **WHEN** the overview page loads with no goals
- **THEN** the strategy section MUST be hidden or show a prompt to set goals first
