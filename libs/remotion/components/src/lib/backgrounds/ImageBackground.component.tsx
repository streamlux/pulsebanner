import React from 'react';
import { AbsoluteFill, Img } from 'remotion';

type ImageBackgroundProps = {
    src?: string;
};

export const ImageBackground: React.FC<ImageBackgroundProps> = ({ src, children }) => (
    <>
        <AbsoluteFill>
            <Img src={src ?? 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500'} />
        </AbsoluteFill>
        <AbsoluteFill>{children}</AbsoluteFill>
    </>
);
