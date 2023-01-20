/* eslint-disable @typescript-eslint/no-empty-function */
import { TfDiff, Json } from '../types';
import Parser from './parser';

abstract class TerraformParser implements Parser {
  constructor () {}
  abstract parseResource (diff: TfDiff, tfPlan: Json): Promise<Json | undefined> 
}

export {
  TerraformParser
};
export default TerraformParser;