import S3 from "aws-sdk/clients/s3";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";
import { createS3 } from "../database/s3ClientHelper";
import env from "../env";
import { logger } from "../logger";

export async function download(bucket: string, key: string): Promise<string | undefined> {
    const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

    try {
        const result: PromiseResult<S3.GetObjectOutput, AWSError> = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        return result?.Body?.toString();
    } catch (e) {
        if ((e as AWSError).code === "NoSuchKey") {
            return undefined;
        }

        logger.error(`Failed to download object from S3`, { bucket, key, error: e });
        return undefined;
    }
}
