import React from 'react';
import { Watermark } from '../Watermark';
import '../fonts.module.css';
import twitchLogo from '../../assets/TwitchGlitchWhite.svg';
import { Img } from 'remotion';

interface Event {
    title: string;
    day: string;
    time: string;
}

type ScheduleProps = {
    events: Event[];
    watermark?: boolean;
};

export const Schedule: React.FC<ScheduleProps> = ({ events, watermark }) => {
    return (
        <div style={{ height: '100%' }}>
            <div style={{ padding: '2% 0 10% 0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ fontSize: '72px', fontWeight: 'bolder', textTransform: 'uppercase', textAlign: 'center' }}>This week on Twitch</p>
                <div
                    style={{
                        padding: '4% 10% 4% 10%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        justifyContent: 'stretch',
                        alignContent: 'stretch',
                        alignItems: 'stretch',
                        justifyItems: 'stretch',
                        minHeight: '80%',
                    }}
                >
                    {events.map((event: Event) => (
                        <div>
                            <div
                                style={{
                                    flexGrow: 1,
                                    fontSize: '48px',
                                    display: 'flex',
                                    width: '100%',
                                    justifyItems: 'stretch',
                                    alignItems: 'stretch',
                                    justifyContent: 'stretch',
                                    alignContent: 'stretch',
                                }}
                            >
                                <p style={{ flexGrow: 1, fontSize: '48px', fontWeight: 'bold' }}>{event.day}</p>
                                <p style={{ marginLeft: '5%', justifySelf: 'flex-end' }}>{event.time}</p>
                            </div>
                            <p style={{ flexGrow: 1, paddingLeft: '6%', fontSize: '48px', fontWeight: 'bold' }}>{event.title}</p>
                        </div>
                    ))}
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', textAlign: 'center', display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'stretch' }}>
                    <Img style={{ margin: '0 5% 0 5%' }} width="76px" src={typeof twitchLogo === 'string' ? twitchLogo : (twitchLogo as any).src} />
                    <p style={{ fontSize: '72px' }}>
                        twitch.tv/<strong>PulseBanner</strong>
                    </p>
                </div>
            </div>
            {watermark && <Watermark text="Schedule created with PulseBanner.com" fontSize="36px" />}
        </div>
    );
};
