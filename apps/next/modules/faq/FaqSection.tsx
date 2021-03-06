import { Box, VStack, Heading, Divider, SimpleGrid, Text, useColorMode, Link, Button, Stack, Center } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { ReactElement, FC } from 'react';
import { FaqItem } from './faqData';
import { FaqItemC } from './FaqItem';
import NextLink from 'next/link';

type FaqSectionProps = {
    items: FaqItem[];
};

export const FaqSection: FC<FaqSectionProps> = ({ items }): ReactElement => {
    const router = useRouter();
    return (
        <Box name="faq">
            <VStack spacing={[2, 4]}>
                <Heading fontSize="3xl" w="full" textAlign="left">
                    Frequently asked questions
                </Heading>
                <Stack w="full" direction={['column', 'row']}>
                    <Text>Have more questions? Ask us in our Discord!</Text>
                    <Center>
                        <NextLink href="/discord" passHref>
                            <Button as="a" variant="link" target={'_blank'} colorScheme={'twitter'}>
                                Click here to join
                            </Button>
                        </NextLink>
                    </Center>
                </Stack>
                <Divider />
                <SimpleGrid columns={[1, 2]} spacing={[8]}>
                    {items.map((item: FaqItem) => (
                        <FaqItemC key={item.id} item={item}/>
                    ))}
                </SimpleGrid>
                {router.asPath !== '/faq' && (
                    <Center>
                        <NextLink href="/faq" passHref>
                            <Button as="a" variant="link" colorScheme={'twitter'}>
                                All frequently asked questions
                            </Button>
                        </NextLink>
                    </Center>
                )}
            </VStack>
        </Box>
    );
};
