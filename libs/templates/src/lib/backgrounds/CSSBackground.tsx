import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Layer } from '../Layer';

type CssBackgroundProps = {
    style: React.CSSProperties;
};

const CSSBackground: React.FC<CssBackgroundProps> = ({ style, children }) => (
    <AbsoluteFill style={{ height: '100%', width: '100%', background: 'linear-gradient(to right, #b149ff 0%, #00ffff 100%)', ...style }}>{children}</AbsoluteFill>
);

type Props = React.ComponentProps<typeof CSSBackground>;

export default {
    component: CSSBackground,
    defaultProps: {
        style: {
            background: 'linear-gradient(to right, #b149ff 0%, #00ffff 100%)',
        },
    },
    form: () => <p>This is the form</p>,
    name: 'CSS background',
    description: 'This is a test',
} as Layer<typeof CSSBackground>;
