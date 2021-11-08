import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface PanelProps {
    name: string;
}

export const Panel: React.FC<PanelProps> = ({ name, children }) => (
    <Box border="1px" borderColor="GrayText" borderRadius="md" p="4" experimental_spaceY="2">
        <Heading size="md">{name}</Heading>
        {children}
    </Box>
);
