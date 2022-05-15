import { BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

export const Card: React.FC<{ props?: BoxProps, children: React.ReactNode; }> = ({ children, props }) => {
    return (
        <Flex direction="column" shadow={'md'} rounded="md" p="4" experimental_spaceY="8" bg='whiteAlpha.100' {...(props ?? {})}>
            {children}
        </Flex>
    );
};
