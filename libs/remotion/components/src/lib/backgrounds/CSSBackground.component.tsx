import React from 'react';
import { AbsoluteFill } from 'remotion';

type CssBackgroundProps = {
    style: React.CSSProperties;
};

export const CSSBackground: React.FC<CssBackgroundProps> = ({ style, children }) => <AbsoluteFill style={{ height: '100%', width: '100%', ...style }}>{children}</AbsoluteFill>;
