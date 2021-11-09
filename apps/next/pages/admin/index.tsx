import React from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import { Box, Center, Heading, SimpleGrid } from '@chakra-ui/react';
import { Database } from '../../modules/admin/Database';
import { Webhooks } from '../../modules/admin/Webhooks';
import { Session } from '../../modules/admin/Session';

export default function Page() {
    useAdmin({ required: true });
    return (
        <Box mt="8" w="full">
            <Center>
                <Heading>Admin dashboard</Heading>
            </Center>
            <Center>
                <SimpleGrid columns={2} spacing={10} my="8">
                    <Database />
                    <Webhooks />
                    <Session />
                </SimpleGrid>
            </Center>
        </Box>
    );
}
