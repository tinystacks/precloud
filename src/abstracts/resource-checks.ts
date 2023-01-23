import { ResourceDiffRecord, SmokeTestOptions } from '../types';

abstract class ResourceChecks {
  abstract checkResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>;
}

export {
  ResourceChecks
};

export default ResourceChecks;