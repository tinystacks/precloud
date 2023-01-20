import {
  existsSync,
  mkdirSync,
  writeFileSync
} from 'fs';
import { TMP_DIRECTORY } from '../../constants';
import { CliError } from '../../errors';
import {
  IacFormat,
  OsOutput,
  ResourceDiffRecord,
  SmokeTestOptions
} from '../../types';
import { runCommand } from '../../utils';
import {
  parseCdkDiff,
  parseTerraformDiff
} from './parser';

function createTmpDirectory () {
  if (!existsSync(TMP_DIRECTORY)){
    mkdirSync(TMP_DIRECTORY, { recursive: true });
  }
}

function handleNonZeroExitCode (output: OsOutput, process: string) {
  if (output?.exitCode !== 0) {
    throw new CliError(`${process} failed with exit code ${output?.exitCode}`);
  }
}

async function prepareCdk (config: SmokeTestOptions): Promise<ResourceDiffRecord[]> {
  const output: OsOutput = await runCommand('cdk diff');
  handleNonZeroExitCode(output, 'cdk diff');
  const diffFileName = `${TMP_DIRECTORY}/diff.txt`;
  writeFileSync(diffFileName, output.stderr);
  const parsedDiff = await parseCdkDiff(output.stderr, config);
  writeFileSync(`${TMP_DIRECTORY}/aws-cdk-diff.json`, JSON.stringify(parsedDiff, null, 2));
  return parsedDiff;
}

async function prepareTf (config: SmokeTestOptions): Promise<ResourceDiffRecord[]> {
  const initOutput: OsOutput = await runCommand('terraform init');
  handleNonZeroExitCode(initOutput, 'terraform init');
  const planOutput: OsOutput = await runCommand(`terraform plan -out=${TMP_DIRECTORY}/tfplan`);
  handleNonZeroExitCode(planOutput, 'terraform plan');
  const planFileName = `${TMP_DIRECTORY}/plan.json`;
  const showOutput: OsOutput = await runCommand(`terraform show -no-color -json ${TMP_DIRECTORY}/tfplan > ${planFileName}`);
  handleNonZeroExitCode(showOutput, 'terraform show');
  const parsedDiff = await parseTerraformDiff(planFileName, config);
  writeFileSync(`${TMP_DIRECTORY}/tf-diff.json`, JSON.stringify(parsedDiff, null, 2));
  return parsedDiff;

}

async function prepareForSmokeTest (config: SmokeTestOptions): Promise<ResourceDiffRecord[]> {
  createTmpDirectory();
  const { format } = config;
  switch (format) {
    case IacFormat.awsCdk:
      return prepareCdk(config);
    case IacFormat.tf:
      return prepareTf(config);
    default:
      return [];
  }
}

export {
  prepareForSmokeTest
};