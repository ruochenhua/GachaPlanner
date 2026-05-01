## ADDED Requirements

### Requirement: User can simulate cross-game resource allocation
The system SHALL provide an interactive simulator on the overview page that allows the user to adjust resource allocation across games. The total resource pool SHALL remain constant — increasing one game's allocation MUST decrease another game's allocation automatically.

#### Scenario: Increasing allocation for one game
- **WHEN** user taps the [+] button on a game's allocation bar
- **THEN** the game's allocated pulls increase by the step size (default 10)
- **AND** the system automatically deducts the same amount from the game with the highest current probability
- **AND** the probability for all affected games is recalculated within 300ms
- **AND** the UI updates to show the new allocation and probabilities

#### Scenario: Fine-tuning with slider
- **WHEN** user drags the allocation slider for a game
- **THEN** the game's allocated pulls update in real time
- **AND** the system deducts/adds to other games to maintain the total
- **AND** probabilities update with a 300ms throttle

#### Scenario: Resetting to original allocation
- **WHEN** user taps the "Reset" button in the simulator
- **THEN** all games revert to their original resource allocation
- **AND** probabilities are recalculated to match the original state

#### Scenario: Total resource conservation
- **GIVEN** the user has 180 total pulls across 2 games
- **WHEN** user increases Game A by 30 pulls
- **THEN** Game B MUST decrease by 30 pulls
- **AND** the total displayed at the bottom MUST remain 180
