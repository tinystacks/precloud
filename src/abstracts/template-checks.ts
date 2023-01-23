import { ResourceDiffRecord, SmokeTestOptions } from '../types';

abstract class TemplateChecks {
  abstract checkTemplate (resources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>;
}

export {
  TemplateChecks
};

export default TemplateChecks;