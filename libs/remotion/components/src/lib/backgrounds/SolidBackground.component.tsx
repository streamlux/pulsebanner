import React from 'react';
import { CSSBackground } from './CSSBackground.component';

type SolidBackgroundProps = {
    color: string;
};

export const SolidBackground: React.FC<SolidBackgroundProps> = ({ color, children }) => (
    <CSSBackground
        style={{
            background: color,
        }}
    >
        {children}
    </CSSBackground>
);
