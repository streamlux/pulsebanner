import { Center, Box, Wrap, WrapItem, Link, useColorMode } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import NextLink from 'next/link';

export const AdminPartnerNav: FC = (): ReactElement => {
    const { colorMode } = useColorMode();

    return (
        <Center mb="8">
            <Box maxW={['95vw']} background={colorMode === 'dark' ? 'gray.700' : 'blackAlpha.200'} mx="2" py="2" rounded="md">
                <Center id="nav-links" fontSize={['sm', 'md']} px="5vw">
                    <Wrap spacing={['4', '8', '8', '8']}>
                        <WrapItem>
                            <NextLink href="/admin/partner/applications" passHref>
                                <Link>Applications</Link>
                            </NextLink>
                        </WrapItem>
                        <WrapItem>
                            <NextLink href="/admin/partner/partner" passHref>
                                <Link>Partners</Link>
                            </NextLink>
                        </WrapItem>
                        <WrapItem>
                            <NextLink href="/admin/partner/commission" passHref>
                                <Link>Referrals</Link>
                            </NextLink>
                        </WrapItem>
                    </Wrap>
                </Center>
            </Box>
        </Center>
    );
};
