## ADDED Requirements

### Requirement: System generates strategy options for resource allocation
The system SHALL automatically generate 2-3 strategy options based on the current resource allocation and goals. Each option MUST include a name, resource allocation per game, resulting probabilities, a human-readable conclusion, and a one-tap apply action.

#### Scenario: Generating strategies on overview load
- **WHEN** the overview page loads
- **AND** at least one goal exists
- **THEN** the system generates strategy options
- **AND** displays them in the strategy section

#### Scenario: Applying a strategy
- **GIVEN** the user is viewing strategy options
- **WHEN** user taps "Apply" on a strategy card
- **AND** confirms in the dialog
- **THEN** the system updates each game's resource allocation to match the strategy
- **AND** saves the new allocation to storage
- **AND** refreshes the overview page with updated data

#### Scenario: Strategy with budget recommendation
- **GIVEN** no strategy can achieve acceptable probability with current resources
- **WHEN** the system generates strategies
- **THEN** one option MUST include a recommended top-up amount
- **AND** show the projected probabilities with the additional budget

#### Scenario: No goals set
- **WHEN** the overview page loads with no goals
- **THEN** the strategy section MUST be hidden or show a prompt to set goals first
