import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import './fonts.module.css';

interface WatermarkProps {
    text: string;
    fontSize?: React.CSSProperties['fontSize'];
}

export const Watermark: React.FC<WatermarkProps> = ({ text, fontSize }) => (
    <AbsoluteFill style={{ height: '100%', width: '100%' }}>
        <div
            style={{
                position: 'absolute',
                transform: 'translate(50%, 0%)',
                right: '50%',
                bottom: '0',
                background: 'rgba(255, 255, 255, 0.50)',
                borderRadius: '5px 5px 0 0',
                width: 'fit-content',
            }}
        >
            <div
                style={{
                    fontSize: fontSize ?? '24x',
                    fontFamily: 'Inter',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyItems: 'center',
                    padding: '0px 8px 0px 8px',
                    color: 'black',
                }}
            >
                <span>{text}</span>
            </div>
        </div>
    </AbsoluteFill>
);
