import isNil from 'lodash.isnil';
import isPlainObject from 'lodash.isplainobject';
import { Json } from '../types';

export function dontReturnEmpty (properties: Json): Json | undefined {
  if (isPlainObject(properties)) {
    const values = Object.values(properties);
    const objectIsEmpty = values.every((value) => {
      if(isPlainObject(value)) {
        return isNil(dontReturnEmpty(value));
      } else if (Array.isArray(value)) {
        return value.map(dontReturnEmpty).every(isNil);
      }
      return isNil(value);
    });
    return objectIsEmpty ? undefined : properties;
  }
  return undefined;
}