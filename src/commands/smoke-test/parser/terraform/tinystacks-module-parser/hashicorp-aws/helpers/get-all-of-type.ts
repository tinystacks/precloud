import { Json, TfDiff } from '../../../../../../../types';
import { getResource } from './get-resource';

function getAllOfType (tfPlan: Json, type: string, moduleAddress: string): (TfDiff & Json)[] {
  const homeModule = tfPlan?.planned_values?.root_module?.child_modules?.find((mod: Json) => mod.address === moduleAddress);
  const resourcesForType = homeModule?.resources?.filter((resource: Json) => resource.type === type) || [];
  return resourcesForType.map((resource: Json) => {
    const stubbedDiff: TfDiff = {
      address: resource.address,
      resourceType: resource.type,
      logicalId: resource.name,
      index: resource.index
    };
    const resourceProperties = getResource(stubbedDiff, tfPlan);
    return {
      address: resource.address,
      resourceType: resource.type,
      logicalId: resource.name,
      index: resource.index,
      properties: resourceProperties
    };
  });
}

export {
  getAllOfType
};