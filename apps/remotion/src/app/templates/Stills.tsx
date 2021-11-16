import { Composer, BackgroundComponents, ForegroundComponents } from '@pulsebanner/remotion/components';
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
