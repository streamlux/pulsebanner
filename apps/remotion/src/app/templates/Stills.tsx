import { Composer, Backgrounds, Foregrounds } from '@pulsebanner/templates';
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
                }}
                height={500}
                width={1500}
            />
        </>
    );
};
