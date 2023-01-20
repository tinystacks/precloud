import { Json } from '../../../types';

// Standard Types
const SQS_QUEUE = 'SQS_QUEUE';
const S3_BUCKET = 'S3_BUCKET';
const VPC = 'VPC';
const NAT_GATEWAY = 'NAT_GATEWAY';
const EIP = 'EIP';
const SUBNET = 'SUBNET';
const ROUTE_TABLE_ASSOCIATION = 'ROUTE_TABLE_ASSOCIATION';
const ROUTE = 'ROUTE';
const ROUTE_TABLE = 'ROUTE_TABLE';
const INTERNET_GATEWAY = 'INTERNET_GATEWAY';

// Cloudformation Types
const CFN_SQS_QUEUE = 'AWS::SQS::Queue';
const CFN_S3_BUCKET = 'AWS::S3::Bucket';
const CFN_VPC = 'AWS::EC2::VPC';
const CFN_NAT_GATEWAY = 'AWS::EC2::NatGateway';
const CFN_EIP = 'AWS::EC2::EIP';
const CFN_SUBNET = 'AWS::EC2::Subnet';
const CFN_ROUTE_TABLE_ASSOCIATION = 'AWS::EC2::SubnetRouteTableAssociation';
const CFN_ROUTE = 'AWS::EC2::Route';
const CFN_ROUTE_TABLE = 'AWS::EC2::RouteTable';

const CloudformationTypes = {
  CFN_SQS_QUEUE,
  CFN_S3_BUCKET,
  CFN_VPC,
  CFN_NAT_GATEWAY,
  CFN_EIP,
  CFN_SUBNET,
  CFN_ROUTE_TABLE_ASSOCIATION,
  CFN_ROUTE,
  CFN_ROUTE_TABLE
};

// Terraform Types
const TF_SQS_QUEUE = 'aws_sqs_queue';
const TF_S3_BUCKET = 'aws_s3_bucket';
const TF_VPC = 'aws_vpc';
const TF_NAT_GATEWAY = 'aws_nat_gateway';
const TF_EIP = 'aws_eip';
const TF_SUBNET = 'aws_subnet';
const TF_ROUTE_TABLE_ASSOCIATION = 'aws_route_table_association';
const TF_ROUTE = 'aws_route';
const TF_ROUTE_TABLE = 'aws_route_table';
const TF_INTERNET_GATEWAY = 'aws_internet_gateway';

const TerraformTypes = {
  TF_SQS_QUEUE,
  TF_S3_BUCKET,
  TF_VPC,
  TF_NAT_GATEWAY,
  TF_EIP,
  TF_SUBNET,
  TF_ROUTE_TABLE_ASSOCIATION,
  TF_ROUTE,
  TF_ROUTE_TABLE,
  TF_INTERNET_GATEWAY
};

const resourceTypeMap: Json = {
  SQS_QUEUE,
  [CFN_SQS_QUEUE]: SQS_QUEUE,
  [TF_SQS_QUEUE]: SQS_QUEUE,
  S3_BUCKET,
  [CFN_S3_BUCKET]: S3_BUCKET,
  [TF_S3_BUCKET]: S3_BUCKET,
  VPC,
  [CFN_VPC]: VPC,
  [TF_VPC]: VPC,
  NAT_GATEWAY,
  [CFN_NAT_GATEWAY]: NAT_GATEWAY,
  [TF_NAT_GATEWAY]: NAT_GATEWAY,
  EIP,
  [CFN_EIP]: EIP,
  [TF_EIP]: EIP,
  SUBNET,
  [CFN_SUBNET]: SUBNET,
  [TF_SUBNET]: SUBNET,
  ROUTE_TABLE_ASSOCIATION,
  [CFN_ROUTE_TABLE_ASSOCIATION]: ROUTE_TABLE_ASSOCIATION,
  [TF_ROUTE_TABLE_ASSOCIATION]: ROUTE_TABLE_ASSOCIATION,
  ROUTE,
  [CFN_ROUTE]: ROUTE,
  [TF_ROUTE]: ROUTE,
  ROUTE_TABLE,
  [CFN_ROUTE_TABLE]: ROUTE_TABLE,
  [TF_ROUTE_TABLE]: ROUTE_TABLE,
  INTERNET_GATEWAY,
  [TF_INTERNET_GATEWAY]: INTERNET_GATEWAY
};

function getStandardResourceType (type: string): string {
  return resourceTypeMap[type];
}

export {
  SQS_QUEUE,
  S3_BUCKET,
  VPC,
  NAT_GATEWAY,
  EIP,
  SUBNET,
  ROUTE_TABLE_ASSOCIATION,
  ROUTE,
  ROUTE_TABLE,
  CloudformationTypes,
  TerraformTypes,
  getStandardResourceType
};