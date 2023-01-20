import { ResourceDiffRecord, SmokeTestOptions } from '../types';

abstract class QuotaChecker {
  abstract checkQuota (resourceType: string, resources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>;
}

export {
  QuotaChecker
};

export default QuotaChecker;