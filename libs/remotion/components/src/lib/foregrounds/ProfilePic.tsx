import { AbsoluteFill, Img } from 'remotion';

type ProfilePicProps = {
    text?: string;
    fontColor: string;
    showText: boolean;
    fontStyle: string;
    imageUrl: string;
    color1: string;
    color2: string;
    liveBackgroundColor: string;
    top?: boolean;
    hideLive?: boolean;
};

export const ProfilePic: React.FC<ProfilePicProps> = ({
    text = 'LIVE',
    fontColor = 'black',
    showText = true,
    fontStyle = '',
    liveBackgroundColor = 'red',
    color1 = 'crimson',
    color2 = '#f90',
    imageUrl = 'https://pbs.twimg.com/profile_images/1477190865613250560/bP4B0ImS_400x400.jpg',
    top = false,
    hideLive = false,
}) => {
    const live = top ? (
        <AbsoluteFill>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'Inter' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <div style={{ fontFamily: fontStyle, width: '100%', alignItems: 'center', paddingTop: '2px', display: 'flex', justifyContent: 'center' }}>
                        {showText && (
                            <h1
                                style={{
                                    color: fontColor,
                                    fontSize: '56px',
                                    borderRadius: '0 0 18px 18px',
                                    padding: '0px 12px 4px 12px',
                                    backgroundColor: liveBackgroundColor,
                                    textAlign: 'center',
                                    alignItems: 'flex-end',
                                    margin: 0,
                                    lineHeight: 1.3,
                                }}
                            >
                                {text}
                            </h1>
                        )}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    ) : (
        <AbsoluteFill>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'Inter' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontFamily: fontStyle, width: '100%', alignItems: 'center', paddingTop: '2px', display: 'flex', justifyContent: 'center' }}>
                        {showText && (
                            <h1
                                style={{
                                    color: fontColor,
                                    fontSize: '56px',
                                    borderRadius: '18px 18px 0 0',
                                    padding: '0px 12px 4px 12px',
                                    backgroundColor: liveBackgroundColor,
                                    textAlign: 'center',
                                    alignItems: 'flex-end',
                                    margin: 0,
                                    lineHeight: 1.3,
                                }}
                            >
                                {text}
                            </h1>
                        )}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );

    return (
        <>
            <AbsoluteFill>
                <div style={{ borderRadius: '100%', padding: '24px', background: `-webkit-linear-gradient(left top, ${color1} 0%, ${color2} 100%)` }}>
                    <div style={{ background: 'black', borderRadius: '100%', padding: 0, margin: 0, overflow: 'visible', maxWidth: '352px', maxHeight: '352px' }}>
                        <Img src={imageUrl} width={352} height={352} style={{ borderRadius: '100%', height: '354px', width: '354px' }} />
                    </div>
                </div>
            </AbsoluteFill>
            {!hideLive && live}
        </>
    );
};
