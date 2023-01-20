import get from 'lodash.get';
import isPlainObject from 'lodash.isplainobject';
import { Json, JsonFile, TfDiff } from '../../../../../../types';

function getTfEntry (diff: TfDiff, tfJson: JsonFile[]): Json | undefined {
  const { logicalId, resourceType } = diff;
  let tfEntry: Json;
  for (const tfConfig of tfJson) {
    tfEntry = get(tfConfig.contents?.resource, `${resourceType}.${logicalId}[0]`);
    if (tfEntry && isPlainObject(tfEntry)) {
      break;
    }
  }
  return tfEntry;
}

export {
  getTfEntry
};