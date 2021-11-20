import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import './foregrounds/fonts.module.css';

export const Watermark: React.FC = () => (
    <AbsoluteFill style={{ height: '100%', width: '100%' }}>
        <div
            style={{
                position: 'absolute',
                transform: 'translate(50%, 0%)',
                right: '50%',
                bottom: '0',
                background: 'rgba(255, 255, 255, 0.50)',
                borderRadius: '5px 5px 0 0',
                height: '32px',
            }}
        >
            <div
                style={{
                    fontSize: '24px',
                    fontFamily: 'Inter',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyItems: 'center',
                    padding: '0px 6px 0px 6px',
                    color: 'black',
                }}
            >
                <span>Twitch live banner by PulseBanner.com</span>
            </div>
        </div>
    </AbsoluteFill>
);
