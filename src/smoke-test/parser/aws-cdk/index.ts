import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import {
  CDK_DIFF_CREATE_SYMBOL,
  CDK_DIFF_DELETE_SYMBOL,
  CDK_DIFF_UPDATE_SYMBOL,
  TINYSTACKS_AWS_CDK_PARSER
} from '../../../constants';
import {
  CdkDiff,
  ChangeType,
  IacFormat,
  Json,
  ResourceDiffRecord,
  DiffSection,
  SmokeTestOptions
} from '../../../types';

function partitionDiff (diff: string[], diffHeaders: string[]): DiffSection[] {
  const headerIndices: { [key: string]: number } = diffHeaders.reduce<{ [key: string]: number }>((acc, header) => {
    const headerIndex = diff.findIndex(line => line.trim() === header);
    acc[header] = headerIndex;
    return acc;
  }, {});

  const allHeaderIndices: number[] = Object.values(headerIndices).sort();
  return Object.entries(headerIndices).reduce<DiffSection[]>((acc, [ header, headerIndex ]) => {
    const sectionName = header.trim().replace('Stack ', '');
    const nextStackHeaderIndex = allHeaderIndices[allHeaderIndices.indexOf(headerIndex) + 1];
    
    const stackDiffLines: string[] = diff.slice(headerIndex + 1, nextStackHeaderIndex);

    acc.push({
      sectionName,
      diffLines: stackDiffLines
    });
    return acc;
  }, []);
}

function separateStacks (diff: string[]): DiffSection[] {
  const stackHeaders = diff.filter(line => line.trim().startsWith('Stack '));
  return partitionDiff(diff, stackHeaders);
}

function getChangeTypeForCdkDiff (changeTypeSymbol: string): ChangeType {
  switch (changeTypeSymbol) {
    case CDK_DIFF_CREATE_SYMBOL:
      return ChangeType.CREATE;
    case CDK_DIFF_UPDATE_SYMBOL:
      return ChangeType.UPDATE;
    case CDK_DIFF_DELETE_SYMBOL:
      return ChangeType.DELETE;
    default:
      return ChangeType.UNKNOWN;
  }
}

function parseDiffLine (diff: string): CdkDiff {
  const [ changeTypeSymbol, resourceType, cdkPath, logicalId ] = diff.trim().replace(/\t/g, '').split(' ').filter(elem => elem.trim().length !== 0);
  return {
    changeTypeSymbol,
    resourceType: resourceType?.indexOf('::') > 0 ? resourceType : undefined,
    cdkPath,
    logicalId
  };
}

function tryToUseParser (diff: CdkDiff, cloudformationTemplate: Json, parserName: string): Json | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      parseResource
    } = require(parserName) || {};
    if (parseResource) return parseResource(diff, cloudformationTemplate);
    return undefined;
  }
  catch (error) {
    return undefined;
  }
}

function parseCdkResource (diff: CdkDiff, cloudformationTemplate: Json, config: SmokeTestOptions): Json {
  const {
    awsCdkParsers = []
  } = config;
  if (!awsCdkParsers.includes(TINYSTACKS_AWS_CDK_PARSER)) awsCdkParsers.push(TINYSTACKS_AWS_CDK_PARSER);
  let properties = {};
  for (const parser of awsCdkParsers) {
    const response = tryToUseParser(diff, cloudformationTemplate, parser);
    if (response) {
      properties = response;
      break;
    }
  }
  return properties;
}

function composeCdkResourceDiffRecords (stackName: string, diffs: string[] = [], config: SmokeTestOptions = {}): ResourceDiffRecord[] {
  const templateJson: Json = JSON.parse(readFileSync(resolvePath(`./cdk.out/${stackName}.template.json`)).toString() || '{}');
  return diffs.reduce<ResourceDiffRecord[]>((acc: ResourceDiffRecord[], diff: string): ResourceDiffRecord[] => {
    const cdkDiff: CdkDiff = parseDiffLine(diff);
    const {
      changeTypeSymbol,
      resourceType,
      cdkPath,
      logicalId
    } = cdkDiff;
    const changeType = getChangeTypeForCdkDiff(changeTypeSymbol);
    if (changeType === ChangeType.UNKNOWN || !resourceType || !cdkPath || !logicalId) return acc;
    const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(templateJson.Resources).find(([key]) => key === logicalId) || [];
    const resourceDiffRecord: ResourceDiffRecord = {
      stackName,
      format: IacFormat.awsCdk,
      changeType,
      resourceType: cfnEntry.Type || resourceType,
      address: cdkPath,
      logicalId,
      properties: parseCdkResource(cdkDiff, templateJson, config)
    };
    acc.push(resourceDiffRecord);
    return acc;
  }, []);
}

function parseStackDiff (stackDiffLines: DiffSection, config: SmokeTestOptions): ResourceDiffRecord[] {
  const {
    sectionName: stackName,
    diffLines
  } = stackDiffLines;
  const diffHeaders = ['IAM Statement Changes', 'IAM Policy Changes', 'Parameters', 'Resources', 'Outputs', 'Other Changes'];

  const diffSections = partitionDiff(diffLines, diffHeaders);
  const resourceDiffs = diffSections.find(diffSection => diffSection.sectionName === 'Resources');
  return composeCdkResourceDiffRecords(stackName, resourceDiffs?.diffLines, config);
}

function parseCdkDiff (diffTxt: string, config: SmokeTestOptions): ResourceDiffRecord[] {
  const diff = diffTxt.split('\n').filter(line => line.trim().length !== 0);
  const stackDiffLines = separateStacks(diff);
  return stackDiffLines.reduce<ResourceDiffRecord[]>((acc, stackDiff) => {
    acc.push(...parseStackDiff(stackDiff, config));
    return acc;
  }, []);
}

export {
  parseCdkDiff
};