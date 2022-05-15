import React from 'react';
import { CSSBackground } from './CSSBackground.component';

type GradientBackgroundProps = {
    leftColor: string;
    rightColor: string;
    children?: React.ReactNode;
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ rightColor, leftColor, children }) => (
    <CSSBackground
        style={{
            background: `linear-gradient(to right, ${leftColor} 0%, ${rightColor} 100%)`,
        }}
    >
        {children}
    </CSSBackground>
);
