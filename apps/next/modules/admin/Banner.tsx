import React from 'react';
import { Box, chakra, Code } from '@chakra-ui/react';
import { Panel } from './Panel';
import useSWR from 'swr';
import type { Banner as BannerType } from '@prisma/client';

export const Banner: React.FC = () => {
    const { data } = useSWR<BannerType>('banner', async () => (await fetch('/api/banner')).json());

    return (
        <Panel name="Banner details">
            <Box maxW="full">
                <Code as={chakra.pre} variant="subtle" p="2" rounded="md" maxW="full" overflowWrap="break-word" overflow="auto">
                    {data ? JSON.stringify(data, null, 4) : 'No banner'}
                </Code>
            </Box>
        </Panel>
    );
};
