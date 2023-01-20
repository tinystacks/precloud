import { CliError } from './cli-error';

const CONFLICT_MESSAGE = 'Conflict!';

class ConflictError extends CliError {
  constructor (reason: string, ...hints: string[]) {
    super(CONFLICT_MESSAGE, reason, ...hints);
  }
}

export {
  ConflictError
};