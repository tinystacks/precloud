import { ResourceDiffRecord, SmokeTestOptions } from '../types';

abstract class ResourceTester {
  abstract testResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>;
}

export {
  ResourceTester
};

export default ResourceTester;