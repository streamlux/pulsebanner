import S3 from "aws-sdk/clients/s3";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";
import { env } from "process";
import { createS3 } from "../database/s3ClientHelper";

export async function download(bucket: string, key: string): Promise<string | undefined> {
    const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

    try {
        const result: PromiseResult<S3.GetObjectOutput, AWSError> = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        return result.Body.toString();
    } catch (e) {
        console.error('Failed to get object from S3. ', e);
        return undefined;
    }
}
