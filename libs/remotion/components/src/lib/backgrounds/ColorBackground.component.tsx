import React from 'react';
import { CSSBackground } from './CSSBackground.component';

type ColorBackgroundProps = {
    color: string;
    children?: React.ReactNode;
};

export const ColorBackground: React.FC<ColorBackgroundProps> = ({ color, children }) => (
    <CSSBackground
        style={{
            background: color,
        }}
    >
        {children}
    </CSSBackground>
);
