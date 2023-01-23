const TMP_DIRECTORY = '/tmp/predeploy/tmp';

const CDK_DIFF_CREATE_SYMBOL = '[+]';
const CDK_DIFF_UPDATE_SYMBOL = '[~]';
const CDK_DIFF_DELETE_SYMBOL = '[-]';

const TF_DIFF_CREATE_ACTION = 'create';
const TF_DIFF_UPDATE_ACTION = 'update';
const TF_DIFF_DELETE_ACTION = 'delete';
const TF_DIFF_NO_OP_ACTION = 'no-op';

const AWS_TF_PROVIDER_NAME = 'registry.terraform.io/hashicorp/aws';

const TINYSTACKS_AWS_CDK_PARSER = '@tinystacks/aws-cdk-parser';
const TINYSTACKS_TF_RESOURCE_PARSER = '@tinystacks/terraform-resource-parser';
const TINYSTACKS_TF_MODULE_PARSER = '@tinystacks/terraform-module-parser';
const TINYSTACKS_AWS_RESOURCE_CHECKS = '@tinystacks/aws-resource-checks';
const TINYSTACKS_AWS_TEMPLATE_CHECKS = '@tinystacks/aws-template-checks';

export {
  TMP_DIRECTORY,
  CDK_DIFF_CREATE_SYMBOL,
  CDK_DIFF_UPDATE_SYMBOL,
  CDK_DIFF_DELETE_SYMBOL,
  TF_DIFF_CREATE_ACTION,
  TF_DIFF_UPDATE_ACTION,
  TF_DIFF_DELETE_ACTION,
  TF_DIFF_NO_OP_ACTION,
  AWS_TF_PROVIDER_NAME,
  TINYSTACKS_AWS_CDK_PARSER,
  TINYSTACKS_TF_RESOURCE_PARSER,
  TINYSTACKS_TF_MODULE_PARSER,
  TINYSTACKS_AWS_RESOURCE_CHECKS,
  TINYSTACKS_AWS_TEMPLATE_CHECKS
};