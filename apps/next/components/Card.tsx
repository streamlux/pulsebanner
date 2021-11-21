import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export const Card: React.FC<{ props?: BoxProps }> = ({ children, props }) => {
    const styles = useColorModeValue<BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    return (
        <Box rounded="md" p="4" experimental_spaceY="8" {...styles} {...(props ?? {})}>
            {children}
        </Box>
    );
};
