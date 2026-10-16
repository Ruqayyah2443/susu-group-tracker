import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMoney, formatMoney } from '../src/money.js';

test('parses amounts into exact integer pesewas', () => {
  assert.equal(parseMoney('50'), 5000);
  assert.equal(parseMoney('50.5'), 5050);
  assert.equal(parseMoney('0.10'), 10);
});

test('rejects more than 2 decimals and float noise', () => {
  assert.throws(() => parseMoney('10.999'));
  assert.throws(() => parseMoney(0.1 + 0.2));
  assert.throws(() => parseMoney('abc'));
});

test('formats pesewas back to text', () => {
  assert.equal(formatMoney(5000), '50.00');
  assert.equal(formatMoney(5), '0.05');
});