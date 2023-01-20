import cached from 'cached';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve as resolvePath  } from 'path';
import { parse } from '@cdktf/hcl2json';
import { Json, TfDiff, TxtFile, JsonFile } from '../../../../types';
import {
  TerraformTypes
} from '../../../smoke-tests/aws/resources';
import {
  parseEip,
  parseS3Bucket,
  parseSqsQueue,
  parseNatGateway,
  parseRoute,
  parseRouteTable,
  parseRouteTableAssociation,
  parseSubnet,
  parseVpc
} from './hashicorp-aws';
import { TMP_DIRECTORY } from '../../../../constants';

const {
  TF_SQS_QUEUE,
  TF_S3_BUCKET,
  TF_EIP,
  TF_VPC,
  TF_NAT_GATEWAY,
  TF_SUBNET,
  TF_ROUTE_TABLE_ASSOCIATION,
  TF_ROUTE,
  TF_ROUTE_TABLE
} = TerraformTypes;

const AwsCdkResourceParsers: {
  [tfType: string]: (diff: TfDiff, tfPlan: Json, tfFiles: TxtFile[], tfJson: JsonFile[]) => Json
} = {
  [TF_SQS_QUEUE]: parseSqsQueue,
  [TF_S3_BUCKET]: parseS3Bucket,
  [TF_EIP]: parseEip,
  [TF_VPC]: parseVpc,
  [TF_NAT_GATEWAY]: parseNatGateway,
  [TF_SUBNET]: parseSubnet,
  [TF_ROUTE_TABLE_ASSOCIATION]: parseRouteTableAssociation,
  [TF_ROUTE]: parseRoute,
  [TF_ROUTE_TABLE]: parseRouteTable
};

const fiveMinutesInSeconds = 5 * 60;
const tfFilesCache = cached('tfFiles', {
  backend: {
    type: 'memory'
  },
  defaults: {
    expire: fiveMinutesInSeconds
  }
});

function getTfFiles (): TxtFile[] {
  const files = readdirSync(resolvePath('./'));
  return files.filter(fileName => fileName.endsWith('.tf') && fileName !== 'variables.tf' && fileName !== 'outputs.tf')
    .map((name: string) => ({
      name,
      contents: readFileSync(name).toString()
    }));
}

async function getTfJson (tfFiles: TxtFile[]): Promise<JsonFile[]> {
  const tfJson = [];
  for (const tfFile of tfFiles) {
    const {
      name,
      contents
    } = tfFile;
    const fileJson = await parse(name, contents);
    tfJson.push({ name, contents: fileJson });
  }
  return tfJson;
}

async function parseResource (diff: TfDiff, tfPlan: Json): Promise<Json | undefined> {
  const tfFiles = await tfFilesCache.getOrElse('tf-files', () => getTfFiles()) as TxtFile[];
  const tfJson = await tfFilesCache.getOrElse('tf-files-json', async () => await getTfJson(tfFiles)) as JsonFile[];
  writeFileSync(`${TMP_DIRECTORY}/tf-json.json`, JSON.stringify(tfJson, null, 2));
  const resourceParser = AwsCdkResourceParsers[diff.resourceType];
  if (resourceParser && !diff.address?.startsWith('module')) return resourceParser(diff, tfPlan, tfFiles, tfJson);
  return undefined;
}

export {
  parseResource
};