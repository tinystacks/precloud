# Developing Plugins

You can contribute to the ecosystem of this module by developing plugins.  Plugins can be additional parsers, quota checks, or resource tests.  To develop a plugin, start by installing our types modules.  Each specific type of plugin is essentially an implementation of an abstract class we publish along with our types for this module.  With that in mind, we typically recommend you develop plugins in [Typescript](https://www.typescriptlang.org/), but you can use any language that's capable of transpiling to Javascript since that is how you will distribute your plugin (via npm).  See below for further details on developing the different types of plugins we support.

## Parsers

Parsers are functions that given information about a resource in an IaC template return JSON that represents that resources base API definition.  Since the inputs are different based on the IaC format, we currently publish two different abstract classes to guide development for parser plugins for AWS CDK and Terraform.

### AWS CDK Parser

This type of parser uses information derived from the output of `cdk diff` and the synthesized Cloudformation template to extract the base API definition for a given cdk resource.

A plugin implementing this type of parser must export a class that extends our `AwsCdkParser` abstract class.  This primarily includes a named method `parseResource` with a specific method signature `(diff: CdkDiff, cloudformationTemplate: Json) => Promise<Json | undefined>`.

See our default parser [TinyStacksAwsCdkParser]() for an in depth example.

### Terraform Parser

This type of parser uses information derived from the `terraform plan` command to extract the base API definition for a given terraform resource.

A plugin implementing this type of parser must export a class that extends our `TerraformParser` abstract class.  This primarily includes a named method `parseResource` with a specific method signature `(diff: TfDiff, tfPlan: Json) => Promise<Json | undefined>`.

See our default parser [TinyStacksTerraformResourceParser]() for an in depth example.

Note that you can also write a plugin that only attempts to parse resources from a specific Terraform module.  This can be helpful in reducing the scope of you parser plugin since you will only have to crawl through known patterns in the tfplan (think references).

For an example of a module specific parser, see our [TinyStacksTerraformModuleParser]();

### Expected Parser Behavior

Besides correctly implementing the proper abstract class, a parser plugin should behave as follows:
* Parsers should never throw.
  - Any thown errors will be ignored and the result from that parser will be considered undefined.
* Parsers should be stateless and deterministic.
  - Given the same input, a parser should always yield the same output.
* If you can't parse a resource, just return `undefined`.
  - Returning undefined allows other configured parsers to try to parse the resource.

## Quota Checks

A quota check plugin, as it's name implies, uses information about the proposed resources from the IaC template and verifies that these resources can be created without encountering quota limit errors.

A quota check plugin must export a class that extends our `QuotaChecker` abstract class.  This primarily includes a named method `checkQuota` with a specific method signature `(resourceType: string, resources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>`.

See our default parser [TinyStacksAwsQuotaChecker]() for an in depth example.

### Expected Quota Check Behavior

Besides correctly implementing the `QuotaChecker` abstract class, a quota check plugin should behave as follows:
* Quota checks should throw a `QuotaError` if the deployment of the IaC template would encounter a quota limit error.
* Any other recoverable errors should be handled internally and retries should be implemented where reasonable.
* If an error is potentially the result of bad configuration, consider throwing a `CliError` with helpful `hints`.
* Quota checks should be read only.
  - The scope of permissions is set by the end user via whatever credentials they allow to come through the [Node Provider Chain](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromnodeproviderchain).
  - If your quota check methods encounter 401's or other auth related errors, consider throwing a `CliError` explaining why the check failed.
* If your plugin does not support a specific resource type, _do not throw an error_, just ignore it.

## Resource Tests

A resource test plugin, as it's name implies, uses information about the proposed resources from the IaC template and performs some form of validation to ensure that the resource can be successfully deployed or is configured correctly.

A resource test plugin must export a class that extends our `ResourceTester` abstract class.  This primarily includes a named method `testResource` with a specific method signature `(resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<void | never>`.

See our default parser [TinyStacksAwsResourceTester]() for an in depth example.

### Expected Resource Test Behavior

Besides correctly implementing the `ResourceTester` abstract class, a resource test plugin should behave as follows:
* Resource tests should throw a `CliError` if the deployment of the IaC template would encounter a runtime error.
* Any other recoverable errors should be handled internally and retries should be implemented where reasonable.
* If an error is potentially the result of bad configuration, consider throwing a `CliError` with helpful `hints`.
* Resource tests should be read only.
  - The scope of permissions is set by the end user via whatever credentials they allow to come through the [Node Provider Chain](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromnodeproviderchain).
  - If your resource test methods encounter 401's or other auth related errors, consider throwing a `CliError` explaining why the check failed.
* If your plugin does not support a specific resource type, _do not throw an error_, just ignore it.