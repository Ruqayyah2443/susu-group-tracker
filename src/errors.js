export class SusuError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SusuError';
  }
}