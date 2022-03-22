import { Composer } from '@pulsebanner/remotion/components';
import React from 'react';
import { Still } from 'remotion';

export const RemotionVideo: React.FC = () => {
    return (
        <>
            <Still
                id="pulsebanner"
                component={Composer}
                defaultProps={{
                    backgroundId: 'CSSBackground',
                    backgroundProps: {},
                    foregroundId: 'ImLive',
                    foregroundProps: {},
                    watermark: true,
                }}
                height={500}
                width={1500}
            />
        </>
    );
};

export const RemotionProfilePicture: React.FC = () => {
    return (
        <>
            <Still
                id="twitterProfilePic"
                component={Composer}
                defaultProps={{
                    backgroundId: 'ImageBackground',
                    backgroundProps: {},
                    foregroundId: 'ProfilePic',
                    foregroundProps: {},
                }}
                height={400}
                width={400}
            />
        </>
    );
};

export const RemotionPartnerMediaKit: React.FC = () => {
    return (
        <>
            <Still
                id="partnerMediaKit"
                component={Composer}
                defaultProps={{
                    backgroundId: 'ImageBackground',
                    backgroundProps: {},
                    foregroundId: 'BasicPartnerImageWithCode',
                    foregroundProps: {},
                }}
                height={1256}
                width={2400}
            />
        </>
    );
};
