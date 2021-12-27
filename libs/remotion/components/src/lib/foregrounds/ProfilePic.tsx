type ProfilePicProps = {
    text?: string;
    fontColor: string;
    showText: boolean;
    fontStyle: string;
};

export const ProfilePic: React.FC<ProfilePicProps> = ({ text, fontColor = 'black', showText = true, fontStyle = '' }) => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'Inter' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: fontStyle, width: '100%', alignItems: 'flex-end', paddingTop: '4px' }}>
                    {showText && <h1 style={{ color: fontColor, fontSize: '86px', width: '100%', textAlign: 'center', alignItems: 'flex-end', margin: 0 }}>{text}</h1>}
                </div>
            </div>
        </div>
    );
};
