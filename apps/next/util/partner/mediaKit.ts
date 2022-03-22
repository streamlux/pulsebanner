import S3 from 'aws-sdk/clients/s3';
import { env } from 'process';
import { remotionAxios } from '../axios';
import { createS3 } from '../database/s3ClientHelper';
import { logger } from '../logger';
import { basicPartnerCodeBackground, partnerCodeWithMembershipBackground } from './constants';
import { upsertMediaKitEntry } from './partnerHelpers';
import { BackgroundImageId, MediaKitImage, PartnerRemotionRequestBody, StandardBackgroundProps, StandardForegroundProps } from './types';

export class PartnerMediaKit {
    userId: string;
    discountCode: string;
    twitchUsername: string;
    twitterUsername: string;
    standardForegroundProps: StandardForegroundProps;
    s3: S3;
    mediaKitMap: Record<MediaKitImage, any>;
    failedImageRenderings: MediaKitImage[]; // upload to this even on s3 failure because that is still out-of-sync/not available for user

    constructor(userId: string, discountCode: string, twitchUsername: string, twitterUsername: string) {
        this.userId = userId;
        this.discountCode = discountCode;
        this.twitchUsername = twitchUsername;
        this.twitterUsername = twitterUsername;
        this.standardForegroundProps = {
            discountCode: this.discountCode,
            twitchUsername: this.twitchUsername,
            twitterUsername: this.twitterUsername,
        };
        this.s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);
        this.mediaKitMap = {
            BasicPartnerImageWithCode: this.generateTwitterCardBasicPartnerImageWithCode(),
            PartnerCodeWithMembershipImage: this.generateTwitterCardPartnerCodeWithMembershipBackground(),
        };
        this.failedImageRenderings = [];
    }

    private generateTwitterCardBasicPartnerImageWithCode = async () => {
        const basicPartnerImageWithCodeBackgroundProps: StandardBackgroundProps = {
            src: basicPartnerCodeBackground,
        };

        const basicPartnerImageWithCodeRequestBody: PartnerRemotionRequestBody = {
            foregroundId: MediaKitImage.BasicPartnerImageWithCode,
            backgroundId: BackgroundImageId.ImageBackground,
            foregroundProps: this.standardForegroundProps,
            backgroundProps: basicPartnerImageWithCodeBackgroundProps,
        };

        const key = `${this.userId}/twitterCard/${basicPartnerImageWithCodeRequestBody.foregroundId}.png`;

        let response = null;
        try {
            response = await remotionAxios.get('/partnerMediaKit', { data: basicPartnerImageWithCodeRequestBody, responseType: 'stream' });
        } catch (err) {
            console.log('remotion error: ', err);
            logger.error('Remotion error trying to get image. ', { requestData: basicPartnerImageWithCodeRequestBody, error: err })
            this.failedImageRenderings = [...this.failedImageRenderings, MediaKitImage.BasicPartnerImageWithCode];
            return;
        }
        try {
            if (response !== null) {
                await this.s3.upload({ Bucket: 'partner-media-kit', Key: key, Body: response.data, ACL: 'public-read', ContentType: 'image/png' }).promise();
            }
        } catch (err) {
            console.log('error uploading to s3: ', err);
            logger.error('Error uploading partner media kit image to s3.', { userId: this.userId, attemptedFileName: key, error: err });
            this.failedImageRenderings = [...this.failedImageRenderings, MediaKitImage.BasicPartnerImageWithCode];
            return;
        }
    };

    private generateTwitterCardPartnerCodeWithMembershipBackground = async () => {
        const partnerCodeWithMembershipBackgroundProps: StandardBackgroundProps = {
            src: partnerCodeWithMembershipBackground,
        };

        const partnerCodeWithMembershipRequestBody: PartnerRemotionRequestBody = {
            foregroundId: MediaKitImage.PartnerCodeWithMembershipImage,
            backgroundId: BackgroundImageId.ImageBackground,
            foregroundProps: this.standardForegroundProps,
            backgroundProps: partnerCodeWithMembershipBackgroundProps,
        };

        const key = `${this.userId}/twitterCard/${partnerCodeWithMembershipRequestBody.foregroundId}.png`;

        let response = null;
        try {
            response = await remotionAxios.get('/partnerMediaKit', { data: partnerCodeWithMembershipRequestBody, responseType: 'stream' });
        } catch (err) {
            console.log('remotion error: ', err);
            logger.error('Remotion error trying to get image. ', { requestData: partnerCodeWithMembershipRequestBody, error: err })
            this.failedImageRenderings = [...this.failedImageRenderings, MediaKitImage.PartnerCodeWithMembershipImage];
            return;
        }
        try {
            if (response !== null) {
                await this.s3.upload({ Bucket: 'partner-media-kit', Key: key, Body: response.data, ACL: 'public-read', ContentType: 'image/png' }).promise();
            }
        } catch (err) {
            console.log('error uploading to s3: ', err);
            logger.error('Error uploading partner media kit image to s3.', { userId: this.userId, attemptedFileName: key, error: err });
            this.failedImageRenderings = [...this.failedImageRenderings, MediaKitImage.PartnerCodeWithMembershipImage];
            return;
        }
    };

    // add any new image rendering function below
    generateMediaKit = async (partnerId: string, mediaKitImageList?: MediaKitImage[]) => {
        if (mediaKitImageList) {
            mediaKitImageList.forEach(async (image: MediaKitImage) => {
                await this.mediaKitMap[image];
            });
        } else {
            Object.keys(this.mediaKitMap).forEach(async (image: MediaKitImage) => {
                await this.mediaKitMap[image];
            });
        }

        // update/insert into the partnerMediaKit table
        // we only make this method call when necessary, and it is required that we check/update the partnerMediaKit table
        await upsertMediaKitEntry(partnerId, this.failedImageRenderings);
    };
}
