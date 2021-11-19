import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import './foregrounds/fonts.module.css';

export const Watermark: React.FC = () => (
    <AbsoluteFill style={{ height: '100%', width: '100%' }}>
        <div style={{ position: 'absolute', right: '0', top: '0', background: 'rgba(255, 255, 255, 0.50)', borderRadius: '0 0 0 5px', height: '32px' }}>
            <div style={{ fontSize: '18px', fontFamily: 'Inter', display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '2px' }}>
                <span style={{ paddingRight: '3px' }}>
                    <Img height={24} width={24} src={'http://pulsebanner.com/logo.webp'} />
                </span>{' '}
                <span style={{ color: 'black' }}>PulseBanner.com</span>
            </div>
        </div>
    </AbsoluteFill>
);
