import { Box } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

type MobileHeaderProps = any;

export const MobileHeader: FC<MobileHeaderProps> = (): ReactElement => {
    return (
        <Box position={'absolute'} w="100vw" h="100vh" bg="red.100">
            hi
        </Box>
    );
};
