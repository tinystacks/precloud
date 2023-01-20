/* eslint-disable @typescript-eslint/no-empty-function */
import { CdkDiff, Json } from '../types';
import Parser from './parser';

abstract class AwsCdkParser implements Parser {
  constructor () {}
  abstract parseResource (diff: CdkDiff, cloudformationTemplate: Json): Promise<Json | undefined> 
}

export {
  AwsCdkParser
};
export default AwsCdkParser;