import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../config/index";

const aws = config.aws;

if (!aws.accessKeyId || !aws.secretAccessKey || !aws.s3Bucket) {
  throw new Error("Missing required AWS environment variables");
}

export const s3Client = new S3Client({
  region: aws.region,
  credentials: {
    accessKeyId: aws.secretAccessKey,
    secretAccessKey: aws.secretAccessKey,
  },
});

export const bucketName = aws.s3Bucket;
