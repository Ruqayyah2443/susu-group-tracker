import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SusuGroup } from '../src/group.js';

function makeGroup(weekly = '50.00', names = ['Ama', 'Kofi', 'Esi']) {
  const g = new SusuGroup(weekly);
  names.forEach((n) => g.addMember(n));
  return g;
}

test('rejects zero or negative weekly amount', () => {
  assert.throws(() => new SusuGroup('0'));
  assert.throws(() => new SusuGroup('-5'));
});

test('rejects duplicate members (case-insensitive) and unknown members', () => {
  const g = makeGroup();
  assert.throws(() => g.addMember('ama'), /already exists/);
  assert.throws(() => g.recordContribution('Yaw', '10'), /Unknown member/);
});

test('rejects zero and negative contributions', () => {
  const g = makeGroup();
  assert.throws(() => g.recordContribution('Ama', '0'));
  assert.throws(() => g.recordContribution('Ama', '-10'));
});

test('partial payments accumulate and overpayment is rejected', () => {
  const g = makeGroup();
  g.recordContribution('Esi', '30');
  const result = g.recordContribution('Esi', '20');
  assert.equal(result.stillOwes, '0.00');
  assert.throws(() => g.recordContribution('Esi', '0.01'), /only owes/);
});

test('week cannot close while someone owes, and reports who owes what', () => {
  const g = makeGroup();
  g.recordContribution('Ama', '50');
  g.recordContribution('Kofi', '50');
  g.recordContribution('Esi', '30');
  const result = g.closeWeek();
  assert.equal(result.closed, false);
  assert.deepEqual(result.owing, [{ name: 'Esi', amount: '20.00' }]);
  assert.equal(g.report().week, 1);
  assert.equal(g.report().payouts.length, 0);
});

test('full example: Esi pays the rest, Ama gets 150.00, Kofi is next', () => {
  const g = makeGroup();
  g.recordContribution('Ama', '50');
  g.recordContribution('Kofi', '50');
  g.recordContribution('Esi', '30');
  g.closeWeek();
  g.recordContribution('Esi', '20');
  const result = g.closeWeek();
  assert.equal(result.closed, true);
  assert.deepEqual(result.payout, { week: 1, member: 'Ama', amount: '150.00' });
  const report = g.report();
  assert.equal(report.week, 2);
  assert.equal(report.nextRecipient, 'Kofi');
  assert.equal(report.owing.length, 3);
});

test('money is exact: 0.10 + 0.20 settles 0.30 exactly', () => {
  const g = makeGroup('0.30', ['A', 'B']);
  g.recordContribution('A', '0.10');
  g.recordContribution('A', '0.20');
  g.recordContribution('B', '0.30');
  assert.equal(g.closeWeek().closed, true);
});

test('cannot add members once contributions have started', () => {
  const g = makeGroup();
  g.recordContribution('Ama', '10');
  assert.throws(() => g.addMember('Yaw'), /after contributions/);
});

test('group completes after everyone has been paid once', () => {
  const g = makeGroup('10', ['A', 'B']);
  for (let i = 0; i < 2; i++) {
    g.recordContribution('A', '10');
    g.recordContribution('B', '10');
    g.closeWeek();
  }
  assert.equal(g.report().complete, true);
  assert.deepEqual(g.report().payouts.map((p) => p.member), ['A', 'B']);
  assert.throws(() => g.closeWeek(), /finished/);
});