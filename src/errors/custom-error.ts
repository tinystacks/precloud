class CustomError extends Error {
  name = 'CustomError';
  reason: string;
  hints: string[];
  constructor (message: string, reason?: string, ...hints: string[]) {
    super(message);
    this.name = CustomError.name;
    this.message = message;
    this.reason = reason;
    this.hints = hints || [];
  }
}

export {
  CustomError
};