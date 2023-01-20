// eslint-disable-next-line no-shadow
enum IacFormat {
  tf = 'tf',
  awsCdk = 'aws-cdk'
}

// eslint-disable-next-line no-shadow
enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  NO_CHANGES = 'NO_CHANGES',
  UNKNOWN = 'UNKNOWN'
}

interface OsOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface SmokeTestOptions {
  format?: IacFormat;
  requirePrivateSubnet?: boolean;
  configFile?: string;
  awsCdkParsers?: string[];
  terraformParsers?: string[];
}

interface Json {
  [key: string]: any
}

interface ResourceDiffRecord {
  stackName?: string;
  format: IacFormat;
  changeType: ChangeType;
  resourceType: string;
  logicalId: string;
  address: string;
  index?: string;
  providerName?: string;
  properties: Json;
}

interface CdkDiff {
  changeTypeSymbol?: string;
  resourceType?: string;
  cdkPath: string;
  logicalId: string;
}

interface TfDiff {
  action?: string;
  resourceType?: string;
  address: string;
  index?: string;
  logicalId: string;
}

interface DiffSection {
  sectionName: string,
  diffLines: string[]
}

interface TxtFile {
  name: string;
  contents: string;
}
interface JsonFile {
  name: string;
  contents: Json;
}

export {
  IacFormat,
  OsOutput,
  SmokeTestOptions,
  ChangeType,
  Json,
  ResourceDiffRecord,
  CdkDiff,
  TfDiff,
  DiffSection,
  TxtFile,
  JsonFile
};