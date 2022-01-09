import { Box, Flex, Center, HStack, Avatar, VStack, Link, useColorMode, Text } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

type TestimonialProps = {
    name: string;
    link: string;
    linkText: string;
    avatarSrc: string;
    text: string;
};

export const Testimonial: FC<TestimonialProps> = ({ name, link, avatarSrc, text, linkText }): ReactElement => {
    const { colorMode } = useColorMode();
    return (
        <Box rounded="md" p="3" bg={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.50'} w="sm">
            <Flex justifyContent="space-between" direction="column" h="full">
                <Center>
                    <Text fontSize={['lg', 'xl']} textAlign="center">
                        {'"'}
                        {text}
                        {'"'}
                    </Text>
                </Center>
                <Center>
                    <HStack>
                        <Avatar src={avatarSrc} />
                        <VStack alignContent="left" w="full" my="4" spacing={0}>
                            <Text fontWeight="bold" w="full" textAlign="left">
                                {name}
                            </Text>
                            <Link color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} href={link} target="_blank" w="full" textAlign="left">
                                {linkText}
                            </Link>
                        </VStack>
                    </HStack>
                </Center>
            </Flex>
        </Box>
    );
};
