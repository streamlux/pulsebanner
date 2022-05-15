import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Card } from '@app/components/Card';

interface PanelProps {
    name: string;
    children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ name, children }) => (
    <Card>
        <Box experimental_spaceY="2" h="min" w="full">
            <Heading size="md">{name}</Heading>
            {children}
        </Box>
    </Card>
);
