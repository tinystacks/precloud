import * as cdk from 'aws-cdk-lib';
import { Example } from '../lib/index';

const app = new cdk.App();
new Example(app, 'example');