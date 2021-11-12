import S3 from 'aws-sdk/clients/s3';

export const createS3 = (DO_SPACE_ENDPOINT: string, DO_ACCESS_KEY: string, DO_SECRET: string): S3 => {
    return new S3({
        endpoint: DO_SPACE_ENDPOINT,
        credentials: {
            accessKeyId: DO_ACCESS_KEY,
            secretAccessKey: DO_SECRET,
        },
    });
};
