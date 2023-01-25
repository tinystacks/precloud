# @tinystacks/precloud CLI Documentation

1. [Introduction](README.md#introduction)
1. [How it works](README.md#how-it-works)
1. [Contributing](README.md#contributing)
1. [Installation](README.md#installation)
    1. [Install from the Global NPM registry](README.md#install-from-the-global-npm-registry)
        1. [Try it out](README.md#try-it-out)
    1. [Local Installation](README.md#local-installation)
1. [Usage](README.md#usage)
    1. [precloud](README.md#precloud)
    1. [precloud --version](README.md#precloud---version)
    1. [precloud --help](README.md#precloud---help)
1. [Available Commands](README.md#Available-Commands)
    1. [precloud help](README.md#precloud-help)
    1. [precloud check](README.md#precloud-check)
        1. [Options](README.md#Options)
        1. [Config File](README.md#Config-File)
        1. [Example Config File](README.md#Example-Config-File)
        1. [Check Behaviour](README.md#Check-Behaviour)
        1. [Authentication](README.md#Authentication)
            1. [AWS](README.md#AWS)
            1. [GCP](README.md#GCP)
            1. [Microsoft Azure](README.md#Microsoft-Azure)

## Introduction

[intro-gif](example.gif)

Infrastructure code deployments often fail due to mismatched constraints over resource fields between the infrastructure code, the deployment engine, and the target cloud. For example, you may be able to pass any arbitrary string as a resource name to terraform or AWS CDK, and `plan` or `synth` go through fine, but the deployment may fail because that string failed a naming constraint on the target cloud.

This package is an open source command line interface that is run before deploying to the cloud. It contains rules that check for names, quotas, and resource-specific constraints to make sure that your infrastructure code can be deployed successfully.


## How it works

This package compairs resources in CDK diffs and Terraform Plans against the state of your cloud account. The rules and validations come from default and custom defined "plugins", which are composed of parsers and checkers. See [DEVELOPING_PLUGINS.md](DEVELOPING_PLUGINS.md) for more information.

## Contributing

You may want to check for other attributes before deploying. This package is built using a plugin-model. You can find existing plugins at [PLUGINS.md](PLUGINS.md) and use them easily by adding the plugin to your config file. See the [example config file below](README.md#-example-config-file).

It is easy to create additional tests as plugins, please see [DEVELOPING_PLUGINS.md](DEVELOPING_PLUGINS.md). Make sure to issue a PR to add your plugin to this package!

## Installation

### Install from the Global NPM registry
```bash
# Install the CLI globally
# Using the -g option installs the precloud cli to your shell scope instead of the package scope. 
# It adds the CLI command to bin, allowing you to call precloud from anywhere
npm i -g @tinystacks/precloud;

# Use the CLI, refer to the usage guide below
precloud --version;

```

#### Try it out
```bash
# After installing the CLI, you can try it out on a cdk or terraform package
# An example cdk package is included in this package
git clone https://github.com/tinystacks/precloud.git;

# navigate to the examples directory
cd precloud/examples/cdk;

# install dependencies
npm i;

# (Optional) initalize precloud
precloud init;

# run precloud check
precloud check;

# To see a precloud check fail, uncomment the commented out lines in examples/cdk/index.ts
precloud check;
```

### Local Installation
```bash
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
Performs a check on an AWS CDK app or a Terraform configuration to validate the planned resources can be launched or updated.  

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
|templateChecks|Array\<String\>|A list of npm module names to run template checks.  By default, the [@tinystacks/aws-template-checks](https://github.com/tinystacks/aws-template-checks) package will be used. Any template checks besides this must be installed within or upstream of the IaC repository.|
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
1. The current stack will not surpass the S3 service quota.
1. The current stack will not surpass the Elastic IP Address service quota.
1. The current stack will not surpass the VPC service quota.
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

