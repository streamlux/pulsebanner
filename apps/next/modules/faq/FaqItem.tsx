import { VStack, Heading, Text, ColorMode, Button, Box } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import { FaqItem } from './data';
import NextLink from 'next/link';

type FaqItemCProps = {
    item: FaqItem;
    colorMode: ColorMode;
};

export const FaqItemC: FC<FaqItemCProps> = ({ item, colorMode }): ReactElement => {
    return (
        <VStack w="full" key={item.answer.toString()}>
            <Heading w="full" textAlign="left" fontSize="lg">
                {item.question}
            </Heading>
            <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>{item.answer}</Text>
            {item.learnMoreLink && (
                <Box w="full">
                    <NextLink href={item.learnMoreLink} passHref>
                        <Button as="a" variant="link" colorScheme="twitter">
                            Learn more
                        </Button>
                    </NextLink>
                </Box>
            )}
        </VStack>
    );
};
