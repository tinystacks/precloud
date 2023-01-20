class CliError extends Error {
  name = 'CliError';
  reason: string;
  hints: string[];
  constructor (message: string, reason?: string, ...hints: string[]) {
    super(message);
    this.name = CliError.name;
    this.message = message;
    this.reason = reason;
    this.hints = hints || [];
  }
}

export {
  CliError
};