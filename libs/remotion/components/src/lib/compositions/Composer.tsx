import React from 'react';
import { AbsoluteFill } from 'remotion';
import * as Backgrounds from '../backgrounds';
import * as Foregrounds from '../foregrounds';
import { Watermark } from '../Watermark';

export const Composer: React.FC<{
    foregroundId: keyof typeof Foregrounds;
    backgroundId: keyof typeof Backgrounds;
    backgroundProps: any;
    foregroundProps: any;
    watermark: boolean;
}> = ({ foregroundId, backgroundId, foregroundProps, backgroundProps, watermark }) => {
    const Background = Backgrounds[backgroundId];
    const Foreground = Foregrounds[foregroundId];
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <AbsoluteFill>
                <Background {...backgroundProps} />
            </AbsoluteFill>
            <AbsoluteFill>
                <Foreground {...foregroundProps} />
            </AbsoluteFill>
            {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
            {watermark ? <Watermark /> : <></>}
        </div>
    );
};
