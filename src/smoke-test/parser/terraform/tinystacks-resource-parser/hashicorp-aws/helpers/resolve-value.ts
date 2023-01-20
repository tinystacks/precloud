import isNil from 'lodash.isnil';
import { Json, TfDiff } from '../../../../../../types';
import get from 'lodash.get';

function resolveValue (diff: TfDiff, tfPlan: Json, tfEntry: Json, propertyName: string) {
  const { resourceType, logicalId } = diff;
  const configValue = get(tfEntry, propertyName);
  const plannedValues = tfPlan.planned_values?.root_module?.resources?.find((resource: Json) => resource.type === resourceType && resource.name === logicalId)?.values || {};
  const plannedValue = get(plannedValues, propertyName);
  if (!isNil(plannedValue) && plannedValue !== configValue) return plannedValue;
  return configValue;
}

export {
  resolveValue
};