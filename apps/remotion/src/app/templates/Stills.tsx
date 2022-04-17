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
                    backgroundId: 'ColorBackground',
                    backgroundProps: {},
                    foregroundId: 'ImLive',
                    foregroundProps: {},
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
