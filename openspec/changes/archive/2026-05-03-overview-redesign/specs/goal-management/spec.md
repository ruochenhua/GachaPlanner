## ADDED Requirements

### Requirement: User can set a gacha goal per game
The system SHALL allow the user to set one active gacha goal per supported game. A goal MUST include the target name, target type (character, weapon, or other), and desired rarity level. The goal SHALL be persisted in PlanningStorage under the game's planning data.

#### Scenario: Setting a goal for the first time
- **WHEN** user taps "Add Goal" on the overview page
- **AND** selects a game from the supported list
- **AND** enters a target name and selects target type
- **THEN** the goal is saved to PlanningStorage
- **AND** the overview page displays the new goal card with calculated probability

#### Scenario: Viewing goals on overview
- **WHEN** user opens the overview page
- **AND** at least one goal exists in storage
- **THEN** the system displays a goal card for each game with an active goal
- **AND** each card shows the target name, current probability, and needed pulls

#### Scenario: Deleting a goal
- **WHEN** user taps the `···` menu button on a goal card
- **AND** selects "删除目标" from the ActionSheet
- **AND** confirms deletion in the dialog
- **THEN** the goal is removed from PlanningStorage
- **AND** the overview page removes the card and recalculates summaries

#### Scenario: Empty goals state
- **WHEN** user opens the overview page
- **AND** no goals exist in storage
- **THEN** the system displays an empty state with a prompt to add a goal
- **AND** existing resource overview is shown as a fallback
