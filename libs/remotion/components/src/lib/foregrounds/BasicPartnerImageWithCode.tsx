import { Center, HStack, VStack } from '@chakra-ui/react';
import { AbsoluteFill, Img } from 'remotion';

type PartnerProps = {
    twitchName: string;
    twitterName: string;
    profilePicUrl?: string;
    discountCode: string;
};

export const BasicPartnerImageWithCode: React.FC<PartnerProps> = ({ twitchName, twitterName, profilePicUrl, discountCode }) => {
    const discountText = `Use code ${discountCode.toUpperCase()} at checkout for 10% off!`;
    const streamLinkText = `twitch.tv/${twitchName}`;
    return (
        <AbsoluteFill>
            <Center>
                <div
                    style={{
                        position: 'absolute',
                        top: '30%',
                    }}
                >
                    <HStack spacing={8}>
                        {/* <Img src={profilePicUrl} width={352} height={352} style={{ borderRadius: '100%', height: '354px', width: '354px' }} /> */}
                        <h1
                            style={{
                                color: 'white',
                                fontSize: `${100 - (discountCode?.length ?? 0)}px`,
                                width: '100%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                alignItems: 'flex-end',
                                fontFamily: 'Inter',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'none',
                                textOverflow: 'unset',
                            }}
                        >
                            {twitterName}
                        </h1>
                    </HStack>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: '60%',
                    }}
                >
                    <h1
                        style={{
                            color: 'white',
                            fontSize: `${100 - (discountCode?.length ?? 0)}px`,
                            width: '100%',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            alignItems: 'flex-end',
                            fontFamily: 'Inter',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'none',
                            textOverflow: 'unset',
                        }}
                    >
                        {discountText}
                    </h1>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: '80%',
                    }}
                >
                    <h1
                        style={{
                            color: 'gray',
                            fontSize: `${70 - (streamLinkText?.length ?? 0)}px`,
                            width: '100%',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            alignItems: 'flex-end',
                            fontFamily: 'Inter',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'none',
                            textOverflow: 'unset',
                            textTransform: 'uppercase',
                        }}
                    >
                        {streamLinkText}
                    </h1>
                </div>
            </Center>
        </AbsoluteFill>
    );
};
