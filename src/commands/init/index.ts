import logger from '../../logger';
import { writeFileSync, existsSync } from 'fs';

async function init () { 
  const configData = `
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
  `;
  const dirname = './precloud.config.json';
  if (existsSync(dirname)){
    logger.info('Configuration file already exists, not creating a default one');
    return;
  }
  try { 
    writeFileSync(dirname, configData);
    logger.success('Configuration file successfully created!');
  } catch(e) { 
    logger.error(`Error creating configuration file: ${e}`);
  }
}

export {
  init
};