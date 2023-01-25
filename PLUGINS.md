# Plugins

This module runs on plugins.  Even our default parsers and checks are composed of plugins published as separate npm modules.  This allows our core cli code to stay light and extensible.  To learn how to develop your own plugins see [DEVELOPING_PLUGINS.md].  To learn how to use existing plugins keep reading.

## Using Plugins
In order to use a plugin, you simply need to install it in, or upstream of, the directory that contains your IaC code and then add it to your config file.  Note that there are different fields for the different types of plugins that we support.  Each are named respective to their purpose.  So if you were to add all of our default plugins to your config (which is completely unnecessary but a good demonstration), that process would look something like this:

`npm i -D @tinystacks/aws-cdk-parser @tinystacks/aws-template-checks @tinystacks/aws-resource-checks @tinystacks/terraform-module-parser @tinystacks/terraform-resource-parser`

```json
{
  "awsCdkParsers": [
    "@tinystacks/aws-cdk-parser"
  ],
  "terraformParsers": [
    "@tinystacks/terraform-module-parser",
    "@tinystacks/terraform-resource-parser"
  ],
  "resourceChecks": [
    "@tinystacks/aws-resource-checks"
  ],
  "templateChecks": [
    "@tinystacks/aws-template-checks"
  ]
}
```

If a plugin that you use defines additional configuration properties, you can add those properties directly into your config file.  Check the plugin documentation for the correct property name.  For example, our default resource checks `@tinystacks/aws-resource-checks` defines a config property called `requirePrivateSubnet`.  To set this property, we would simply add to the config above like so:

```json
{
  "awsCdkParsers": [
    "@tinystacks/aws-cdk-parser"
  ],
  "terraformParsers": [
    "@tinystacks/terraform-module-parser",
    "@tinystacks/terraform-resource-parser"
  ],
  "resourceChecks": [
    "@tinystacks/aws-resource-checks"
  ],
  "templateChecks": [
    "@tinystacks/aws-template-checks"
  ],
  "requirePrivateSubnet": true
}
```

## Default Plugins

### Parsers

#### AWS CDK
@tinystacks/aws-cdk-parser

#### Terraform HCL
@tinystacks/terraform-resource-parser
@tinystacks/terraform-module-parser

### Checks
#### AWS
@tinystacks/aws-resource-checks
@tinystacks/aws-template-checks

#### GCP
COMING SOON

#### AZURE
COMING SOON