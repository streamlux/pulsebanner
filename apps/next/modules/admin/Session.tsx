import React from 'react';
import { Box, chakra, Code } from '@chakra-ui/react';
import { Panel } from './Panel';
import { useSession } from 'next-auth/react';

export const Session: React.FC = () => {
    const { data: session } = useSession({ required: false });

    return (
        <Panel name="Session details">
            <Box maxW="full">
                <Code as={chakra.pre} variant="subtle" p="2" rounded="md" maxW="full" overflowWrap="break-word" overflow="auto">
                    {JSON.stringify(session ?? {}, null, 2)}
                </Code>
            </Box>
        </Panel>
    );
};
