import React from 'react';
import { AbsoluteFill, Img } from 'remotion';

type HolidayImageBackgroundProps = {
    src?: string;
};

export const HolidayImageBackground: React.FC<HolidayImageBackgroundProps> = ({ src, children }) => (
    <>
        <AbsoluteFill>
            <Img src={src ?? 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500'} />
        </AbsoluteFill>
        <AbsoluteFill>{children}</AbsoluteFill>
    </>
);
