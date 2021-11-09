import React from 'react';
import { Box, Code } from '@chakra-ui/react';
import { Panel } from './Panel';
import { useSession } from 'next-auth/react';

export const Database: React.FC = () => {
    const { data: session } = useSession({ required: false });

    return (
        <Panel name="Database">
            <Box>
                <Box>
                    <Code variant="subtle" p="2" rounded="md">
                        <pre>{JSON.stringify(session ?? {}, null, 2)}</pre>
                    </Code>
                </Box>
            </Box>
        </Panel>
    );
};
