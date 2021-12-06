import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import imageToBase64 from 'image-to-base64';
import S3 from 'aws-sdk/clients/s3';
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError } from "aws-sdk/lib/error";

export type TwitterResponseCode = 200 | 400;

/**
 * S3 storage
 */
@Injectable()
export class StorageService {

    private readonly s3: S3;

    constructor(config: ConfigService) {
        this.s3 = new S3({
            endpoint: config.get('DO_SPACE_ENDPOINT'),
            credentials: {
                accessKeyId: config.get('DO_ACCESS_KEY'),
                secretAccessKey: config.get('DO_SECRET'),
            },
        });
    }

    async uploadFromUrl(bucket: string, key: string, url: string): Promise<void> {

        // Todo: this is some shady logic, probably would be better to
        // wrap the imageToBase64 call in try/catch
        const imageBase64 = url === 'empty' ? 'empty' : await imageToBase64(url);

        this.s3.upload({ Bucket: bucket, Key: key, Body: imageBase64 }, null, (err) => {
            if (err) {
                Logger.error(err);
                throw new Error(`Failed to upload image with key: '${key}' from url: '${url}' to S3.`);
            }
        });

        Logger.verbose(`Uploaded image with key: '${key}' from url: '${url}' to S3.`);
    }

    /**
     * Returns the base64 of the storage item
     * @param bucket Bucket id
     * @param key Key to download
     */
    async download(bucket: string, key: string): Promise<string> {
        try {
            const s3Object: PromiseResult<S3.GetObjectOutput, AWSError> = await this.s3.getObject({ Bucket: bucket, Key: key }).promise();
            return s3Object.Body.toString();
        } catch (e) {
            Logger.error((e as AWSError).message, 'Failed to download item from S3');
            throw new Error('Failed to download item from S3');
        }
    }
}
