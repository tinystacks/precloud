import { resolve as resolvePath } from 'path';
import { readdirSync } from 'fs';
import { IacFormat } from '../../types';
import { CustomError } from '../../errors';

function detectIacFormat (): IacFormat {
  const files = readdirSync(resolvePath('./'));
  const cdkJson = 'cdk.json';
  const isCdkProject = files.includes(cdkJson);
  
  const tfFileExtension = '.tf';
  const isTfProject = files.some(fileName => fileName.endsWith(tfFileExtension));

  if (isCdkProject && isTfProject) {
    throw new CustomError(
      'Cannot determine IaC format!',
      'Both AWS cdk and terraform files exist in this repository.',
      'You can specify which format to use via the "--format" flag'
    );
  }

  if (isCdkProject) return IacFormat.awsCdk;
  if (isTfProject) return IacFormat.tf;

  throw new CustomError(
    'Cannot determine IaC format!',
    'Neither AWS cdk nor terraform files exist in this repository.',
    'Are you running this command in the correct directory?',
    'You can specify which format to use via the "--format" flag'
  );
} 

export {
  detectIacFormat
};