# Susu Group Tracker

A JavaScript command-line application for managing a rotating savings group.

## Requirements

- Node.js 20 or higher (developed on Node 24)
- No external dependencies, so there is nothing to install

## How to run

```terminal
npm start
```

This opens an interactive prompt (`susu>`). Available commands:

| Command | Example | What it does |
|---|---|---|
| `create <amount>` | `create 50.00` | Creates the group with a weekly contribution in GHS |
| `add <name>` | `add Ama` | Adds a member (payout order = order added) |
| `pay <name> <amount>` | `pay Esi 30` | Records a full or partial contribution for the current week |
| `close` | `close` | Closes the week; pays the pot if everyone has paid in full |
| `report` | `report` | Shows current week, who has paid, who owes, payout history |
| `help` | `help` | Lists the commands |
| `quit` | `quit` | Exits the program |

## Example session

```
susu> create 50
susu> add Ama
susu> add Kofi
susu> add Esi
susu> pay Ama 50
susu> pay Kofi 50
susu> pay Esi 30
susu> close
Week cannot close yet:
  Esi owes GHS 20.00
susu> pay Esi 20
susu> close
Week 1 closed. Ama receives GHS 150.00.
```

## How to run the tests

```vs terminal
npm test
```

Uses Node's built-in test runner (`node --test`). The tests cover money
handling, validation, partial payments, a week that cannot close, and a
full payout cycle.

## Project structure

- `src/money.js`: parses and formats money using integer pesewas
- `src/group.js`: all susu rules (members, contributions, closing weeks, report)
- `src/errors.js`: custom `SusuError` for invalid user actions
- `src/cli.js`: command-line interface
- `test/`: automated tests
- `NOTES.md`: assumptions, decisions and future improvements