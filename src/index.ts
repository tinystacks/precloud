#!/usr/bin/env node

import { Command, Option } from 'commander';
import * as colors from 'colors';
import { smokeTest, init } from './commands';
import logger from './logger';
import { cleanupTmpDirectory } from './hooks';
const program = new Command();
// eslint-disable-next-line
const { version } = require('../package.json');

function handleError (error: Error) {
  logger.cliError(error);
  process.exit(1);
}

try {
  colors.enable();
  
  program
    .name('predeploy')
    .description('TinyStacks predeploy command line interface')
    .version(version);
  
  program.command('smoke-test')
    .description('Performs a smoke-test on an AWS cdk app or a Terraform configuration to validate the planned resources can be launched or updated.')
    .addOption(new Option('-f, --format <format>', 'Specifies the iac format. Can also be set via "format" in the config file.').choices(['tf', 'aws-cdk']))
    .option('-rps, --require-private-subnet', 'For VPC\'s, requires a subnet with egress to the internet, but no ingress. Can also be set via "requirePrivateSubnet" in in the config file.')
    .option('-c, --config-file <config-file>', 'Specifies a config file. Options specified via the command line will always take precedence over options specified in a config file.  Looks for smoke-test.config.json by default.')
    .option('-v, --verbose', 'Log additional details when available (plugin errors, etc.)')
    .action(smokeTest)
    .hook('postAction', cleanupTmpDirectory);

    program.command('init')
    .description('Creates a configuration file from the example shown in the README')
    .action(init);
  
  program.parseAsync()
    .catch(handleError);
} catch (error) {
  handleError(error as Error);
}