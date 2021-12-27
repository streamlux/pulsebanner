import { env } from "process";
import { createS3 } from "../database/s3ClientHelper";

export async function uploadBase64(bucket: string, key: string, base64: string): Promise<void> {
    const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

    try {
        await s3.upload({ Bucket: bucket, Key: key, Body: base64 }).promise();
    } catch (err) {
        console.error('Failed to upload object to S3');
        throw err;
    }

    console.log(`Successfully uploaded object to S3.`);
}
