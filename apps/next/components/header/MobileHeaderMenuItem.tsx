import React, { ReactElement, FC } from 'react';
import NextLink from 'next/link';
import { MenuItem, Button, VStack, Box, Center, Heading, Spacer, HStack, ColorMode, Image, Text } from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';

type MobileHeaderMenuItemProps = {
    imageSrc: string;
    title: string;
    description: string;
    colorMode: ColorMode;
    onNavigate?: () => void;
    href?: string;
};

export const MobileHeaderMenuItem: FC<MobileHeaderMenuItemProps> = ({ imageSrc, title, description, colorMode, href, onNavigate }): ReactElement => {
    console.log('href', href);
    return (
        <NextLink href={href} passHref>
            <Button
                onClick={onNavigate ?? undefined}
                variant={'ghost'}
                bg="gray.700"
                as="a"
                h={['auto', '56']}
                w={['full', '56']}
                p="4"
                _hover={{ bg: 'gray.600' }}
                _active={{ bg: 'gray.600' }}
            >
                <VStack h="full" w='full'>
                    <Heading w="full" textAlign={'left'} fontSize="lg">
                        {title}
                    </Heading>
                    <Box w={['full', 'full']} h={['auto', '24']} px='4'>
                        <Center h="full">
                            <Image src={imageSrc} alt={title} />
                        </Center>
                    </Box>
                </VStack>
            </Button>
        </NextLink>
    );
};
