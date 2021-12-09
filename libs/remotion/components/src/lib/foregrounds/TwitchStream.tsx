import React from 'react';
import { Img } from 'remotion';
import '../fonts.module.css';

type TwitchStreamProps = {
    text?: string;
    backgroundUrl?: string;
    thumbnailUrl: string;
};

export const TwitchStream: React.FC<TwitchStreamProps> = ({
    backgroundUrl,
    thumbnailUrl = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    text,
}) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
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
