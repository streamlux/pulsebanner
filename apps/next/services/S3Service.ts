import env from "@app/util/env";
import { logger } from "@app/util/logger";
import S3 from "aws-sdk/clients/s3";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";

export class S3Service {

    public static createS3(): S3 {
        return new S3({
            endpoint: env.DO_SPACE_ENDPOINT,
            credentials: {
                accessKeyId: env.DO_ACCESS_KEY,
                secretAccessKey: env.DO_SECRET,
            },
        });
    };

    public static async download(bucket: string, key: string): Promise<string | undefined> {
        const s3 = S3Service.createS3();

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

    public static async uploadBase64(bucket: string, key: string, base64: string): Promise<void> {
        const s3 = S3Service.createS3();

        try {
            await s3.upload({ Bucket: bucket, Key: key, Body: base64 }).promise();
        } catch (err) {
            logger.error('Failed to upload object to S3', {
                bucket,
                key
            });
            throw err;
        }

        logger.info(`Successfully uploaded object to S3.`, {
            bucket,
            key
        });
    }

    public static checkValidDownload(base64: string) {
        // https://stackoverflow.com/a/58158656/10237052
        return base64.startsWith('/9j/') || base64.startsWith('iVBORw0KGgo') || base64 === 'empty';
    }
}
