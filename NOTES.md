# Project Notes

## Assumptions and design decisions will be documented here.

The instructions left some things open. These are my choices:

1. **Money is stored as integer pesewas.** GHS 50.00 is stored as 5000.
   Floating-point numbers cannot represent values like 0.1 exactly, so
   whole-number arithmetic avoids rounding errors. Amounts are parsed from
   text, and more than 2 decimal places is rejected.
2. **Members are identified by name, case-insensitive and trimmed.**
   "Ama" and "ama" count as duplicates.
3. **Members cannot be added after contributions start.** Once any
   contribution or payout exists, the member list is locked. This keeps the
   payout order and the pot size fair for everyone already in the group.
4. **Contributions only apply to the current week.** A week can only close
   when it is fully paid, so past weeks are always settled.
5. **A group needs at least 2 members** before a week can close.
6. **The group finishes after every member has received the pot once.**
   After that, further payments and closes are rejected.
7. **Closing a week that is not fully paid is a normal result, not an
   error.** It returns who owes what and changes nothing.
8. **Data is kept in memory only.** Restarting the program starts fresh.

## Design choices

- Business rules live in `group.js`, separate from `cli.js`. This keeps the
  rules testable without the command line, and the same logic could be
  reused behind an API later.
- A custom `SusuError` separates user mistakes (shown as friendly messages)
  from real bugs (which still crash visibly).
- Overpayment is checked against what the member still owes this week, so
  partial payments work naturally.

## What I would improve with more time

- Save the group to a file or database so data survives a restart.
- Define a clearer rule for late joiners (for example, joining at the end
  of the order with an agreed catch-up payment).
- Support multiple groups at once.
- Record dates and times for contributions and payouts.