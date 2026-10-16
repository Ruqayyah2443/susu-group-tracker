import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { SusuGroup } from './group.js';
import { SusuError } from './errors.js';

const HELP = `Commands:
  create <weekly amount>     e.g. create 50.00
  add <member name>          e.g. add Ama
  pay <member name> <amount> e.g. pay Ama 50
  close                      close the current week
  report                     show the current status
  help                       show this message
  quit                       exit`;

function formatReport(r) {
  const lines = [
    `Weekly contribution: GHS ${r.weeklyAmount}`,
    r.complete
      ? 'Status: cycle complete'
      : `Current week: ${r.week} (next payout: ${r.nextRecipient})`,
    `Paid in full: ${r.paidInFull.join(', ') || 'nobody'}`,
    'Owing:',
    ...(r.owing.length
      ? r.owing.map((o) => `  ${o.name} owes GHS ${o.amount}`)
      : ['  nobody']),
    'Payout history:',
    ...(r.payouts.length
      ? r.payouts.map((p) => `  Week ${p.week}: ${p.member} received GHS ${p.amount}`)
      : ['  none yet']),
  ];
  return lines.join('\n');
}

// Runs one command and returns the text to print.

export function execute(line, state) {
  const [command, ...args] = line.trim().split(/\s+/);
  if (!command) return '';

  if (command === 'help') return HELP;

  if (command === 'create') {
    if (state.group) throw new SusuError('A group already exists.');
    state.group = new SusuGroup(args[0]);
    return `Group created with weekly contribution GHS ${state.group.report().weeklyAmount}.`;
  }

  if (!state.group) {
    throw new SusuError('Create a group first, e.g. "create 50.00".');
  }

  switch (command) {
    case 'add':
      return `Added member ${state.group.addMember(args.join(' '))}.`;

    case 'pay': {
      const amount = args.pop();
      const result = state.group.recordContribution(args.join(' '), amount);
      return `${result.member} paid GHS ${result.paid}. Still owes GHS ${result.stillOwes}.`;
    }

    case 'close': {
      const result = state.group.closeWeek();
      if (!result.closed) {
        return [
          'Week cannot close yet:',
          ...result.owing.map((o) => `  ${o.name} owes GHS ${o.amount}`),
        ].join('\n');
      }
      const p = result.payout;
      return (
        `Week ${p.week} closed. ${p.member} receives GHS ${p.amount}.` +
        (result.complete ? '\nEveryone has been paid. Cycle complete!' : '')
      );
    }

    case 'report':
      return formatReport(state.group.report());

    default:
      throw new SusuError(`Unknown command "${command}". Type "help".`);
  }
}

function main() {
  const state = { group: null };
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'susu> ',
  });

  console.log('Susu Group Tracker. Type "help" for commands.');
  rl.prompt();

  rl.on('line', (line) => {
    if (line.trim() === 'quit') return rl.close();
    try {
      const output = execute(line, state);
      if (output) console.log(output);
    } catch (err) {
      if (err instanceof SusuError) console.log(`Error: ${err.message}`);
      else throw err;
    }
    rl.prompt();
  });
}


if (process.argv[1] === fileURLToPath(import.meta.url)) main();