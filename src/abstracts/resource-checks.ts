import { ResourceDiffRecord, CheckOptions } from '../types';

abstract class ResourceChecks {
  abstract checkResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: CheckOptions): Promise<void | never>;
}

export {
  ResourceChecks
};

export default ResourceChecks;