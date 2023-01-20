import isNil from 'lodash.isnil';
import { Json, TfDiff } from '../../../../../../../types';
import get from 'lodash.get';
import isPlainObject from 'lodash.isplainobject';

function getResource (diff: TfDiff, tfPlan: Json): Json {
  const [module, moduleName] = diff.address?.split('.') || [];
  if (!module || !moduleName) return undefined;
  const moduleAddress = `${module}.${moduleName}`;
  
  const homeModule = tfPlan?.planned_values?.root_module?.child_modules?.find((mod: Json) => mod.address === moduleAddress);
  const plannedResource = homeModule?.resources?.find((resource: Json) => resource.address === diff.address) || {};
  const plannedValues = Object.fromEntries(
    Object.entries(plannedResource?.values || {}).filter(([_key, value]) => !isNil(value))
  );
  console.info('plannedValues: ', plannedValues);

  const moduleResource = get(tfPlan, `configuration.root_module.module_calls.${moduleName}.module.resources`) || [];
  const resource = moduleResource.find((res: Json) => res.type === diff.resourceType && res.name === diff.logicalId) || {};
  const referencedValues = Object.entries(resource.expressions || {}).reduce<Json>((acc: Json, [propertyName, value]: [string, Json]) => {
    if (isPlainObject(value)) {
      if (!isNil(value.constant_value)) {
        acc[propertyName] = value.constant_value;
      } else if (!isNil(value.references) && Array.isArray(value.references) && value.references?.length > 0) {
        const { references } = value;
        references.sort((a: string, b: string) => b.split('.').length - a.split('.').length);
        console.info('references: ', references);
        if (references.every((ref: string) => ref.startsWith('each.value') || ref.startsWith('each.key'))) {
          const firstReference = references[0];
          const prefix = firstReference.startsWith('each.value') ? 'each.value' : 'each.key';
          const forEachReference = resource.for_each_expression?.references?.at(0);
          const loopedReference = firstReference.replace(prefix, forEachReference);
          acc[propertyName] = loopedReference;
        } else {
          const directReference = references.filter((ref: string) => !ref.startsWith('each.value') && !ref.startsWith('each.key'))[0];
          acc[propertyName] = directReference;
        }
      }
    }
    return acc;
  }, {});

  console.info('referencedValues: ', referencedValues);

  return {
    ...referencedValues,
    ...plannedValues
  };
}

export {
  getResource
};