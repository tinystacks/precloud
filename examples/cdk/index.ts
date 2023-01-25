import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Example extends Stack {

  constructor(scope: Construct, id: string) {
    super(scope, id);

    new cdk.aws_s3.Bucket(this, 'uniqueBucketConst', {
      bucketName: "a-unique-demo-bucket-name"
    });

    // new cdk.aws_s3.Bucket(this, 'notSoUniqueBucketConst', {
    //   bucketName: "a-unique-demo-bucket-name"
    // });
  }
}
