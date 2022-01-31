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
};

export const HeaderMenuItem: FC<HeaderMenuItemProps> = ({ imageSrc, title, description, colorMode, href }): ReactElement => {
    return (
        <NextLink href={href} passHref>
            <MenuItem as="a" rounded="md" p="0">
                <Button h={['auto', '56']} w={['90vw', '56']} variant={'ghost'} p="4" _focus={{ outline: 'none' }}>
                    <VStack h="full">
                        <Box w="full" h={['32', '24']}>
                            <Center h="full">
                                <Image src={imageSrc} alt={title} />
                            </Center>
                        </Box>
                        <Heading w="full" textAlign={'left'} fontSize="lg">
                            Profile Picture
                        </Heading>
                        <Text fontWeight={'normal'} fontSize="sm" textAlign={'left'} whiteSpace={'normal'}>
                            {description}
                        </Text>
                        <Spacer />
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
            </MenuItem>
        </NextLink>
    );
};
