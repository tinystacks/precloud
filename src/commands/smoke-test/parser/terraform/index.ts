import { readFileSync } from 'fs';
import {
  TF_DIFF_CREATE_ACTION,
  TF_DIFF_DELETE_ACTION,
  TF_DIFF_NO_OP_ACTION,
  TF_DIFF_UPDATE_ACTION,
  TINYSTACKS_TF_MODULE_PARSER,
  TINYSTACKS_TF_RESOURCE_PARSER
} from '../../../../constants';
import {
  ChangeType,
  IacFormat,
  Json,
  ResourceDiffRecord,
  SmokeTestOptions,
  TfDiff
} from '../../../../types';
import logger from '../../../../logger';
import TerraformParser from '../../../../abstracts/terraform-parser';

function getChangeTypeForTerraformDiff (tfChangeType: string): ChangeType {
  switch (tfChangeType) {
    case TF_DIFF_CREATE_ACTION:
      return ChangeType.CREATE;
    case TF_DIFF_UPDATE_ACTION:
      return ChangeType.UPDATE;
    case TF_DIFF_DELETE_ACTION:
      return ChangeType.DELETE;
    case TF_DIFF_NO_OP_ACTION:
      return ChangeType.NO_CHANGES;
    default:
      return ChangeType.UNKNOWN;
  }
}

const parsers: {
  [parserName: string]: TerraformParser
} = {};

async function tryToUseParser (diff: TfDiff, tfPlan: Json, parserName: string): Promise<Json | undefined> {
  try {
    let parserInstance = parsers[parserName];
    if (!parserInstance) {
      const defaultParsers = [TINYSTACKS_TF_RESOURCE_PARSER, TINYSTACKS_TF_MODULE_PARSER];
      const modulePath = defaultParsers.includes(parserName) ?
        parserName :
        require.resolve(parserName, { paths: [process.cwd()] });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const parser = require(modulePath);
      const mainExport = parser?.default ? parser.default : parser;
      if (mainExport) {
        parserInstance = new mainExport();
        const isInstance = parserInstance instanceof TerraformParser;
        const hasParseResource = parserInstance.parseResource && typeof parserInstance.parseResource === 'function';
        if (isInstance || hasParseResource) {
          parsers[parserName] = parserInstance;
        } else {
          logger.warn(`Invalid parser: ${parserName}.`);
          logger.warn(`The main export from ${parserName} does not properly implement TerraformParser.`);
        }
      }
    }
    if (parserInstance) {
      return await parserInstance.parseResource(diff, tfPlan);
    }
    return undefined;
  }
  catch (error) {
    logger.warn(`Invalid parser: ${parserName}.`);
    logger.warn(`The main export from ${parserName} could not be instantiated or it threw an error while parsing the resource.`);
    logger.verbose(error);
    return undefined;
  }
}

async function parseTfResource (diff: TfDiff, tfPlan: Json, config: SmokeTestOptions): Promise<Json> {
  const {
    terraformParsers = []
  } = config;
  if (!terraformParsers.includes(TINYSTACKS_TF_RESOURCE_PARSER)) terraformParsers.push(TINYSTACKS_TF_RESOURCE_PARSER);
  if (!terraformParsers.includes(TINYSTACKS_TF_MODULE_PARSER)) terraformParsers.push(TINYSTACKS_TF_MODULE_PARSER);
  let properties;
  for (const parser of terraformParsers) {
    const response = await tryToUseParser(diff, tfPlan, parser);
    if (response) {
      properties = response;
      break;
    }
  }
  const { address, logicalId, resourceType } = diff;
  if (!properties) logger.warn(`None of the configured parsers could parse resource ${address || `${resourceType}.${logicalId}`}`);
  return properties;
}

async function parseTerraformDiff (planFile: string, config: SmokeTestOptions): Promise<ResourceDiffRecord[]> {
  const planJson: Json = JSON.parse(readFileSync(planFile)?.toString() || '{}');
  const {
    resource_changes = [] as Json[]
  } = planJson;
  
  const resources: ResourceDiffRecord[] = [];
  for (const resourceChange of resource_changes) {
    const {
      address,
      index,
      name: logicalId,
      change: {
        // before = {},
        // after = {},
        actions: [
          beforeAction,
          afterAction
        ] = []
      } = {},
      type,
      provider_name: providerName
    } = resourceChange || {};

    if (afterAction) {
      const beforeDiff: TfDiff = {
        address,
        logicalId,
        action: beforeAction,
        index,
        resourceType: type
      };
      resources.push({
        format: IacFormat.tf,
        resourceType: type,
        changeType: getChangeTypeForTerraformDiff(beforeAction),
        address,
        index,
        logicalId,
        providerName,
        properties: await parseTfResource(beforeDiff, planJson, config)
      });
    }
    const changeType = getChangeTypeForTerraformDiff(afterAction || beforeAction);
    if (changeType !== ChangeType.NO_CHANGES) {
      const afterDiff: TfDiff = {
        address,
        logicalId,
        action: afterAction,
        index,
        resourceType: type
      };
      resources.push({
        format: IacFormat.tf,
        resourceType: type,
        changeType,
        address,
        index,
        logicalId,
        providerName,
        properties: await parseTfResource(afterDiff, planJson, config)
      });
    }
  }
  return resources;
}

export {
  parseTerraformDiff
};