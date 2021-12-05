import React from 'react';
import { Img } from 'remotion';
import { LayerComponent } from '../LayerComponent';
import './fonts.module.css';
import arrowImg from '../../assets/arrow.jpeg';

type ImLiveProps = {
    text?: string;
    thumbnailUrl: string;
    fontColor: string;
    arrow: boolean;
    showText: boolean;
    showUsername: boolean;
    username?: string;
    thumbnailBorderColor: string;
    fontStyle: string;
};

export const ImLive: React.FC<ImLiveProps> = ({
    thumbnailUrl = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    text,
    fontColor = 'black',
    thumbnailBorderColor = 'rgb(145, 71, 255)',
    arrow = true,
    showText = true,
    showUsername = true,
    username,
    fontStyle = '',
}) => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'Inter' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: fontStyle, width: '100%', alignItems: 'flex-end', paddingTop: '4px' }}>
                    {showText && <h1 style={{ color: fontColor, fontSize: '86px', width: '100%', textAlign: 'center', alignItems: 'flex-end', margin: 0 }}>{text}</h1>}
                </div>
                <div style={{ width: '100%', alignItems: 'flex-end', paddingTop: '4px' }}>
                    {showUsername && (
                        <h1 style={{ color: fontColor, fontSize: showText ? '38px' : '86px', width: '100%', textAlign: 'center', alignItems: 'flex-end', margin: 0 }}>
                            {username}
                        </h1>
                    )}
                </div>
                <div style={{ display: 'flex', width: '100%', height: 'min', alignItems: 'bottom', justifyContent: 'flex-end' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignSelf: 'flex-end',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {arrow && (
                            <Img
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                src={typeof arrowImg === 'string' ? arrowImg : (arrowImg as any).src}
                                style={{
                                    transform: 'scaleX(-1) rotate(180deg) translate(0%, 10%)',
                                    filter: fontColor === '#ffffff' ? 'brightness(0) invert(1)' : '',
                                }}
                            />
                        )}

                        <div
                            style={{
                                maxWidth: '33%',
                                margin: '0.4em',
                                background: thumbnailBorderColor,
                                border: `0.4em solid ${thumbnailBorderColor}`,
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
                            <Img src={thumbnailUrl} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const sh = {
    component: ImLive,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    },
    name: "I'm Live!",
    description: "Let your audience know you're live with this awesome live-upating banner.",
} as LayerComponent<typeof ImLive>;
