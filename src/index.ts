#!/usr/bin/env node

import { Command, Option } from 'commander';
import * as colors from 'colors';
import { check, init } from './commands';
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
    .name('precloud')
    .description('TinyStacks precloud command line interface')
    .version(version);
  
  program.command('check')
    .description('Performs a check on an AWS cdk app or a Terraform configuration to validate the planned resources can be launched or updated.')
    .addOption(new Option('-f, --format <format>', 'Specifies the iac format. Can also be set via "format" in the config file.').choices(['tf', 'aws-cdk']))
    .option('-c, --config-file <config-file>', 'Specifies a config file. Options specified via the command line will always take precedence over options specified in a config file.  Looks for precloud.config.json by default.')
    .option('-v, --verbose', 'Log additional details when available (plugin errors, etc.)')
    .action(check)
    .hook('postAction', cleanupTmpDirectory);

  program.command('init')
    .description('Creates a configuration file from the example shown in the README')
    .action(init);
  
  program.parseAsync()
    .catch(handleError);
} catch (error) {
  handleError(error as Error);
}