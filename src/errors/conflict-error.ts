import { CustomError } from './custom-error';

const CONFLICT_MESSAGE = 'Conflict!';

class ConflictError extends CustomError {
  constructor (reason: string, ...hints: string[]) {
    super(CONFLICT_MESSAGE, reason, ...hints);
  }
}

export {
  ConflictError
};