import { ResourceDiffRecord, CheckOptions } from '../types';

abstract class TemplateChecks {
  abstract checkTemplate (resources: ResourceDiffRecord[], config: CheckOptions): Promise<void | never>;
}

export {
  TemplateChecks
};

export default TemplateChecks;