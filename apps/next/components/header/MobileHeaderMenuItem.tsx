import React, { ReactElement, FC } from 'react';
import NextLink from 'next/link';
import { Button, VStack, Box, Center, Heading, Image } from '@chakra-ui/react';

type MobileHeaderMenuItemProps = {
    imageSrc: string;
    title: string;
    description: string;
    onNavigate?: () => void;
    href: string;
};

export const MobileHeaderMenuItem: FC<MobileHeaderMenuItemProps> = ({ imageSrc, title, description, href, onNavigate }): ReactElement => {
    return (
        <NextLink href={href} passHref>
            <Button
                onClick={onNavigate ?? undefined}
                variant={'ghost'}
                bg="gray.700"
                as="a"
                h={['auto', 'auto', '56']}
                w={['full', '80vw']}
                p="4"
                _hover={{ bg: 'gray.600' }}
                _active={{ bg: 'gray.600' }}
            >
                <VStack h="full" w='full'>
                    <Heading w="full" textAlign={'left'} fontSize="lg">
                        {title}
                    </Heading>
                    <Box w={['full', 'full']} h={['auto', 'auto']} px='4'>
                        <Center h={['full', "32"]} my={[0, '8']}>
                            <Image w='80%' src={imageSrc} alt={title} />
                        </Center>
                    </Box>
                </VStack>
            </Button>
        </NextLink>
    );
};
