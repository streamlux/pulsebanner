import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import './fonts.module.css';
import { Watermark } from '../Watermark';

type ImLiveProps = {
    text?: string;
    thumbnailUrl: string;
    showUsername: boolean;
    username?: string;
    watermark: boolean;
};

export const Sway: React.FC<ImLiveProps> = ({
    thumbnailUrl = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    text,
    showUsername = true,
    username,
    watermark = true,
}) => {
    return (
        <>
            <AbsoluteFill>
                <div style={{ position: 'absolute', left: '875px', top: '85px', overflow: 'hidden', fontFamily: 'Inter' }}>
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', width: '100%', height: 'min', alignItems: 'bottom', justifyContent: 'flex-end' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignSelf: 'flex-end',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        alignItems: 'flex-end',
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
                                            margin: '0.7em',
                                            fontSize: '1em',
                                        }}
                                    >
                                        LIVE
                                    </div>
                                    <Img src={thumbnailUrl} width="579px" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AbsoluteFill>

            <AbsoluteFill>
                <div
                    style={{
                        position: 'absolute',
                        top: '75px',
                        left: '290px',
                        display: 'flex',
                        padding: '2px 0 2px 0',
                        width: '392px',
                        height: '80px',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            alignItems: 'flex-end',
                            textAlign: 'center',
                            display: 'flex',
                            justifyItems: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <h1
                            style={{
                                color: 'black',
                                fontSize: `${54 - (username?.length ?? 0)}px`,
                                width: '100%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                alignItems: 'flex-end',
                                fontFamily: 'RoadRage',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'none',
                                textOverflow: 'unset',
                                textTransform: 'uppercase',
                            }}
                        >
                            {username}
                        </h1>
                    </div>
                </div>
            </AbsoluteFill>
            {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
            {watermark ? <Watermark /> : <></>}
        </>
    );
};
