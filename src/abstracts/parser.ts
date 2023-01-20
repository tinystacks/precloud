/* eslint-disable @typescript-eslint/no-empty-function */
import { CdkDiff, Json, TfDiff } from '../types';

interface Parser {
  parseResource (diff: TfDiff | CdkDiff, planOrTemplate: Json): Promise<Json | undefined>
}

export {
  Parser
};

export default Parser;