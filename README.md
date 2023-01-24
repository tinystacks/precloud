# @tinystacks/precloud CLI Documentation

Infrastructure code deployments often fail because resources fail to create due to mismatched constraints over resource fields between the infrastructure code, the deployment engine, and the target cloud. For example, you may be able to pass any arbitrary string as a resource name to terraform or AWS CDK, and `plan` or `synth` go through fine, but the deployment may fail because that string failed a naming constraint on the target cloud.

This package is an open source command line interface that is run before deploying to the cloud. It contains rules that check for names, quotas, and resource-specific constraints to make sure that your infrastructure code can be deployed successfully.

You may want to check for other attributes before deploying. This package is built using a plugin-model. You can find existing plugins at [PLUGINS.md](PLUGINS.md) and use them easily by adding the plugin to your config file. See the [example config file below](README.md#-example-config-file).

It is easy to create additional tests as plugins, please see [DEVELOPING_PLUGINS.md](DEVELOPING_PLUGINS.md). Make sure to issue a PR to add your plugin to this package!

[comment]: #TODO: gif showing how the CLI is used

## Installation

### Install from the Global NPM registry
```
# Install the CLI globally
# Using the -g option installs the precloud cli to your shell scope instead of the package scope. 
#  It adds the CLI command to bin, allowing you to call precloud from anywhere
npm i -g @tinystacks/precloud;

# Use the CLI, refer to the usage guide below
precloud --version;

```


### Local Installation
```
# Clone this package
git clone https://github.com/tinystacks/precloud.git;

# Install dependencies and build
npm i; npm run build;

# Install the CLI globally
# Using the -g option installs the precloud cli to your shell scope instead of the package scope. 
#  It adds the CLI command to bin, allowing you to call precloud from anywhere
npm i -g;

# Use the CLI, refer to the usage guide below
precloud --version;
```

## Usage
### precloud
Shows usage and help information.

### precloud --version
_Alias_: -V
Shows the current installed version number.

### precloud --help
_Alias_: -h
Shows usage and help information.


## Available Commands

### precloud help
Shows usage and help information.

### precloud check
Performs a check on an AWS cdk app or a Terraform configuration to validate the planned resources can be launched or updated.  

#### Options
|Flag|Arguments|Description|
|----|---------|-----------|
|-f, --format|\<format\>|  Specifies the iac format. Can also be set via "format" in the config file. (choices: "tf", "aws-cdk")|
|-c, --config-file|\<config-file\>|  Specifies a config file. Options specified via the command line will always take precedence over options specified in a config file.  Looks for precloud.config.json by default.|
|-h, --help||             display help for this command

#### Config File
Alternatively, instead of specifying options via command line flags, you can set them in a configuration file.  This file must be valid JSON and named either precloud.config.json or the `--config-file` flag specified.
Valid config properties:
|Property name|Type|Description|
|-------------|----|-----------|
|format|String|Specifies the iac format. (valid values: "tf", "aws-cdk")|
|awsCdkParsers|Array\<String\>|A list of npm module names to parse AWS CDK resources.  By default, the internal TinyStacks AWS CDK Parser will be used.  Any parsers besides defaults must be installed in the target cdk repository.|
|terraformParsers|Array\<String\>|A list of npm module names to parse Terraform resources or modules.  By default, the internal TinyStacks Terraform Resource Parser and TinyStacks Terraform Module Parser will be used. Any parsers besides defaults must be installed in the target terraform repository.|
|resourceChecks|Array\<String\>|A list of npm module names to run resource checks.  By default, the [@tinystacks/aws-resource-checks](https://github.com/tinystacks/aws-resource-checks) package will be used. Any resource checks besides this must be installed within or upstream of the IaC repository.|
|templateChecks|Array\<String\>|A list of npm module names to run templaet checks.  By default, the [@tinystacks/aws-template-checks](https://github.com/tinystacks/aws-template-checks) package will be used. Any template checks besides this must be installed within or upstream of the IaC repository.|
|requirePrivateSubnet|Boolean|Option for default plugin `@tinystacks/aws-resource-checks`. When set to true, requires VPCs to have a subnet with egress to the internet, but no ingress. Defaults to `false`.|

#### Example Config File
```json
{
    "awsCdkParsers": [
        "@tinystacks/aws-cdk-parser"
    ],
    "terraformParsers": [
        "@tinystacks/terraform-resource-parser",
        "@tinystacks/terraform-module-parser"
    ],
    "templateChecks": [
        "@tinystacks/aws-template-checks"  
    ],
    "resourceChecks": [
        "@tinystacks/aws-resource-checks"
    ]
}
```

#### Check Behaviour
When the `check` command is run, it will first perform a diffing operation to determine the changes that deploying the stack would make.  For AWS CDK this is `cdk diff`, for Terraform `terraform plan`.

The diff from this operation is then used to identify resources that would change.  These resources are then tested first by running template checks which validate across the resources in the IaC configuration, and then at an individual resource level to determine if any runtime errors might occur during a deployment.

This cli includes some of our plugins for parsing and running template and resource checks by default.
The default plugins will check the following:
1. Any SQS queue names are unique.
1. Any S3 bucket names are unique.
1. The current stack will not surpass the S3 serivce quota.
1. The current stack will not surpass the Elastic IP Address serivce quota.
1. The current stack will not surpass the VPC serivce quota.
1. (Optional) Verifies that the VPC has private subnets (egress-only subnets via a NAT Gateway or Nat Instance(s)).

#### Authentication
This command requires authentication to the Cloud Provider the CDK app or Terraform config will use.  The following authentication methods are supported.

##### AWS
- Environment Variables (preferred)
- Any other authetication method supported by the [Node Provider Chain](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromnodeproviderchain).

##### GCP
Not supported.

##### Microsoft Azure
Not supported.

