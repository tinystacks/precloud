# Developing Plugins

You can contribute to the ecosystem of this module by developing plugins.  Plugins can be additional parsers, template checks, or resource checks.  To develop a plugin, start by installing this module as a peer dependency.  Each specific type of plugin is essentially an implementation of an abstract class we publish along with our types for this module.  With that in mind, we typically recommend you develop plugins in [Typescript](https://www.typescriptlang.org/), but you can use any language that's capable of transpiling to Javascript since that is how you will distribute your plugin (via npm).  See below for further details on developing the different types of plugins we support.

## Types Of Plugins And Their Behaviors
### Parsers

Parsers are functions that given information about a resource in an IaC template return JSON that represents that resources base API definition.  Since the inputs are different based on the IaC format, we currently publish two different abstract classes to guide development for parser plugins for AWS CDK and Terraform.

#### AWS CDK Parser

This type of parser uses information derived from the output of `cdk diff` and the synthesized Cloudformation template to extract the base API definition for a given cdk resource.

A plugin implementing this type of parser must export a class that extends our `AwsCdkParser` abstract class.  This primarily includes a named method `parseResource` with a specific method signature `(diff: CdkDiff, cloudformationTemplate: Json) => Promise<Json | undefined>`.

See our default parser [@tinystacks/aws-cdk-parser](https://github.com/tinystacks/aws-cdk-parser) for an in depth example.

#### Terraform Parser

This type of parser uses information derived from the `terraform plan` command to extract the base API definition for a given terraform resource.

A plugin implementing this type of parser must export a class that extends our `TerraformParser` abstract class.  This primarily includes a named method `parseResource` with a specific method signature `(diff: TfDiff, tfPlan: Json) => Promise<Json | undefined>`.

See our default parser [@tinystacks/terraform-resource-parser](https://github.com/tinystacks/terraform-resource-parser) for an in depth example.

Note that you can also write a plugin that only attempts to parse resources from a specific Terraform module.  This can be helpful in reducing the scope of your parser plugin since you will only have to crawl through known patterns in the tfplan (think references).

For an example of a module specific parser, see our [@tinystacks/terraform-module-parser](https://github.com/tinystacks/terraform-module-parser);

#### Expected Parser Behavior

Besides correctly implementing the proper abstract class, a parser plugin should behave as follows:
* Parsers should never throw.
  - Any thown errors will be ignored and the result from that parser will be considered undefined.
* Parsers should be stateless and deterministic.
  - Given the same input, a parser should always yield the same output.
* If you can't parse a resource, just return `undefined`.
  - Returning undefined allows other configured parsers to try to parse the resource.

### Checks
#### Template Checks

A template check plugin, as it's name implies, uses information about the proposed resources from the IaC template and runs verifications that span the template as a whole.  This could include checking service quotas, validating required tags, etc.

A template check plugin must export a class that extends our `TemplateChecks` abstract class.  This primarily includes a named method `checkTemplate` with a specific method signature `(resources: ResourceDiffRecord[], config: CheckOptions): Promise<void | never>`.

See our default template checks [@tinystacks/aws-template-checks](https://github.com/tinystacks/aws-template-checks) for an in depth example.

##### Expected Template Check Behavior

Besides correctly implementing the `TemplateChecks` abstract class, a template check plugin should behave as follows:
* Don't short circuit your own checks
  - If your `checkTemplate` implementation can result in multiple error paths (i.e. multiple different checks), handle these internally and report them through the logger (see export `logger.cliError`).
* Recoverable errors should be handled internally and retries should be implemented where reasonable.
* If an error is potentially the result of bad configuration, consider throwing a `CliError` with helpful `hints`.
* Template checks should be read only.
  - The scope of permissions is set by the end user via whatever credentials they allow to come through the [Node Provider Chain](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromnodeproviderchain).
  - If your template checks encounter 401's or other auth related errors, consider throwing a `CliError` explaining why the check failed.
* If your plugin does not support a specific resource type, _do not throw an error_, just ignore it.

#### Resource Checks

A resource check plugin, as it's name implies, uses information about the proposed resources from the IaC template and performs some form of validation to ensure that the resource can be successfully deployed or is configured correctly.

A resource check plugin must export a class that extends our `ResourceChecks` abstract class.  This primarily includes a named method `checkResource` with a specific method signature `(resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: CheckOptions): Promise<void | never>`.

See our default resource checks [@tinystacks/aws-resource-checks](https://github.com/tinystacks/aws-resource-checks) for an in depth example.

##### Expected Resource Check Behavior

Besides correctly implementing the `ResourceChecks` abstract class, a resource check plugin should behave as follows:
* Resource checks should throw a `CliError` if the deployment of the IaC template would encounter a runtime error.
* Any other recoverable errors should be handled internally and retries should be implemented where reasonable.
* If an error is potentially the result of bad configuration, consider throwing a `CliError` with helpful `hints`.
* Resource checks should be read only.
  - The scope of permissions is set by the end user via whatever credentials they allow to come through the [Node Provider Chain](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromnodeproviderchain).
  - If your resource checks encounter 401's or other auth related errors, consider throwing a `CliError` explaining why the check failed.
* If your plugin does not support a specific resource type, _do not throw an error_, just ignore it.

#### Extending The Configuration Object
You can extend the configuration object to add any configuration properties you need for your checks plugin by extending our interface `CheckOptions` and subbing in your extended interface for our base interface in the method signature.

Note that we namespaced our additional configuration option; we _strongly_ encourage you to do the same.  We used our scope as the namespace because we don't plan to use the same configuration option in multiple plugins published by us.  You can make your namespace even more unique if necessary.  For example, instead of only using our scope as the namespace `@tinystacks/strictBucketNaming`, we could namespace with the entire package name `@tinystacks/example-ts-resource-check/strictBucketNaming`.

Example:
```js
import { CliError, ResourceDiffRecord, ResourceChecks, CloudformationTypes, TerraformTypes, CheckOptions, getStandardResourceType } from "@tinystacks/precloud";

interface ExampleResourceChecksConfig extends CheckOptions {
  '@tinystacks/strictBucketNaming'?: boolean;
}

class ExampleResourceChecks extends ResourceChecks {
  constructor () { super(); }
  
  async checkResource(resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: ExampleResourceChecksConfig): Promise<void> {
    if (
        (
          resource.resourceType === CloudformationTypes.CFN_S3_BUCKET ||
          resource.resourceType === TerraformTypes.TF_S3_BUCKET
        ) &&
        resource.properties?.Name &&
        config['@tinystacks/strictBucketNaming'] // custom config property!
      ) {
        const format = new RegExp(/[^a-zA-Z0-9-]+/);
        const nameIsInvalid = format.test(resource.properties?.Name);
        if (nameIsInvalid) {
          throw new CliError('Invalid S3 bucket name!', 'Name must only contain alphanumeric characters and hyphens.', 'Rename your bucket to meet these requirements or set "strictBucketNaming" to false if this requirement is unnecessary.')
        }
    }
  }

}

export default ExampleResourceChecks;
```

## Using Your Plugin
To use your plugin it must be resolvable in the directory of the IaC repository you plan to run the cli in.  If you are publishing your plugin as an npm module, this means installing it either in or upstream of the IaC repository's root directory.  Alternatively, if you only need to use your plugin for yourself or don't wish to publish it, you can provide a relative path to your plugin in the config file.

```json
{
  "awsCdkParsers": [
    "@my-scope/my-published-parser"
  ],
  "resourceChecks": [
    "./my-local-resource-checks"
  ]
}
```