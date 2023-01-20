import { CustomError } from './custom-error';

const QUOTA_EXCEEDED_MESSAGE = 'Quota Limit Reached!';

class QuotaError extends CustomError {
  constructor (reason: string, ...hints: string[]) {
    super(QUOTA_EXCEEDED_MESSAGE, reason, ...hints);
  }
}

export {
  QuotaError
};