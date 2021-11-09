import React from 'react';
import { Img } from 'remotion';
import { ImageBackground } from './backgrounds/ImageBackground';
import { CSSBackground } from './backgrounds/CSSBackground';
import './fonts.module.css';

const colorStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    background: 'linear-gradient(to right, #b149ff 0%, #00ffff 100%)',
};

export const TwitchStream: React.FC<{
    text?: string;
    backgroundColor?: string;
    backgroundUrl?: string;
    thumbnailUrl: string;
}> = ({ backgroundUrl, thumbnailUrl, text }) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {backgroundUrl && <ImageBackground src={backgroundUrl} />}
            {!backgroundUrl && <CSSBackground style={colorStyle} />}
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center' }}>
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'flex-end',
                        justifyContent: 'flex-end',
                        zIndex: 10,
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '33%',
                            margin: '0.4em',
                            zIndex: 10,
                            background: 'rgb(145, 71, 255)',
                            border: '0.4em solid rgb(145, 71, 255)',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'Inter',
                                background: 'red',
                                borderRadius: '0.2em',
                                color: 'white',
                                width: 'min-content',
                                height: 'min-content',
                                padding: '0.1em',
                                textAlign: 'center',
                                position: 'absolute',
                                margin: '0.5em',
                                fontSize: '0.6em',
                                zIndex: 120,
                            }}
                        >
                            LIVE
                        </div>
                        <Img
                            src={thumbnailUrl}
                            style={{
                                zIndex: 10,
                            }}
                        />
                    </div>
                </div>
            </div>
            {text && (
                <div style={{ zIndex: 100, fontFamily: 'Inter' }}>
                    <h1 style={{ color: 'white', fontFamily: 'Inter' }}>{text}</h1>
                </div>
            )}
        </div>
    );
};
