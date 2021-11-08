import React from 'react';
import { Box, Button, chakra, Code, Text, useBoolean } from '@chakra-ui/react';
import useSWR from 'swr';
import { Panel } from './Panel';

export const Webhooks: React.FC = () => {
    const { data: webhooks, isValidating: loading } = useSWR('/twitch/subscription', async () => (await fetch('/api/twitch/subscription')).json(), {
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });

    const [showRaw, { toggle }] = useBoolean();

    return (
        <Panel name="Webhooks">
            <Box experimental_spaceY="2">
                <Text>
                    Total webhook subscriptions: {loading && 'Loading...'}
                    {!loading && (webhooks?.subscriptions?.length ?? 'Error')}
                </Text>
                <Button onClick={toggle}>{showRaw ? 'Hide raw' : 'Show raw'}</Button>
                {showRaw && (
                    <Code as={chakra.pre} overflowX="scroll" maxW="100%">
                        {!loading && JSON.stringify(webhooks, null, 2)}
                    </Code>
                )}
            </Box>
        </Panel>
    );
};
