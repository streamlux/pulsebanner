import React from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { Database } from '../../modules/admin/Database';
import { Webhooks } from '../../modules/admin/Webhooks';

export default function Page() {
    useAdmin({ required: true });
    return (
        <Box mt="8">
            <Heading>Admin dashboard</Heading>
            <SimpleGrid columns={2} spacing={10} my="8">
                <Database />
                <Webhooks />
            </SimpleGrid>
        </Box>
    );
}
