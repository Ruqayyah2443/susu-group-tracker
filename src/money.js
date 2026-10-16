import { SusuError } from './errors.js';

export function parseMoney(input) {
  const text = String(input ?? '').trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    throw new SusuError(
      `"${text}" is not a valid amount. Use a number with at most 2 decimals, e.g. 50.00`
    );
  }
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = text.replace('-', '').split('.');
  const pesewas = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return negative ? -pesewas : pesewas;
}

export function formatMoney(pesewas) {
  const whole = Math.floor(pesewas / 100);
  const fraction = String(pesewas % 100).padStart(2, '0');
  return `${whole}.${fraction}`;
}