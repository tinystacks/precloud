import { CdkDiff, Json } from '../../../../../types';
import {
  CloudformationTypes
} from '../../../smoke-tests/aws/resources';
import { parseEip } from './ec2';
import { parseS3Bucket } from './s3';
import { parseSqsQueue } from './sqs';
import { parseNatGateway, parseRoute, parseRouteTable, parseRouteTableAssociation, parseSubnet, parseVpc } from './vpc';

const {
  CFN_SQS_QUEUE,
  CFN_S3_BUCKET,
  CFN_EIP,
  CFN_VPC,
  CFN_NAT_GATEWAY,
  CFN_SUBNET,
  CFN_ROUTE_TABLE_ASSOCIATION,
  CFN_ROUTE,
  CFN_ROUTE_TABLE
} = CloudformationTypes;

const AwsCdkResourceParsers: {
  [cfnType: string]: (diff: CdkDiff, cloudformationTemplate: Json) => Json
} = {
  [CFN_SQS_QUEUE]: parseSqsQueue,
  [CFN_S3_BUCKET]: parseS3Bucket,
  [CFN_EIP]: parseEip,
  [CFN_VPC]: parseVpc,
  [CFN_NAT_GATEWAY]: parseNatGateway,
  [CFN_SUBNET]: parseSubnet,
  [CFN_ROUTE_TABLE_ASSOCIATION]: parseRouteTableAssociation,
  [CFN_ROUTE]: parseRoute,
  [CFN_ROUTE_TABLE]: parseRouteTable
};

function parseResource (diff: CdkDiff, cloudformationTemplate: Json): Json | undefined {
  const resourceParser = AwsCdkResourceParsers[diff.resourceType];
  if (resourceParser) return resourceParser(diff, cloudformationTemplate);
  return undefined;
}

export {
  parseResource
};