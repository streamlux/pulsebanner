import React, { ReactElement, FC } from 'react';
import NextLink from 'next/link';
import { MenuItem, Button, VStack, Box, Center, Heading, Spacer, HStack, ColorMode, Image, Text } from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';

type HeaderMenuItemProps = {
    imageSrc: string;
    title: string;
    description: string;
    colorMode: ColorMode;
    href: string;
    onNavigate?: () => void;
};

export const HeaderMenuItem: FC<HeaderMenuItemProps> = ({ imageSrc, title, description, colorMode, href, onNavigate }): ReactElement => {
    return (
        <NextLink href={href} passHref>
            <Button
                onClick={onNavigate ?? undefined}
                variant={'ghost'}
                bg="gray.700"
                as="a"
                h={['auto', '56']}
                w={['90vw', '56']}
                p="4"
                _hover={{ bg: 'gray.600' }}
                _active={{ bg: 'gray.600' }}
            >
                <VStack h="full">
                    <Heading w="full" textAlign={'left'} fontSize="lg">
                        {title}
                    </Heading>
                    <Text fontWeight={'normal'} fontSize="sm" textAlign={'left'} whiteSpace={'normal'}>
                        {description}
                    </Text>
                    <Box w={['auto', 'full']} h={['full', '24']}>
                        <Center h="full">
                            <Image src={imageSrc} alt={title} />
                        </Center>
                    </Box>
                    <Box w="full">
                        <HStack w="min" p="0" m="0" color={colorMode === 'dark' ? 'blue.200' : 'blue.300'}>
                            <Text textAlign={'left'} w="full" variant={'link'} rightIcon={<FaArrowRight />}>
                                Learn more
                            </Text>
                            <FaArrowRight />
                        </HStack>
                    </Box>
                </VStack>
            </Button>
        </NextLink>
    );
};
