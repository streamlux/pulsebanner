import React from 'react';
import { CSSBackground } from './CSSBackground.component';

type ColorBackgroundProps = {
    color: string;
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
