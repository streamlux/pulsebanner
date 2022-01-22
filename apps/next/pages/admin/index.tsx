import React from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import { Box, Center, Heading, SimpleGrid } from '@chakra-ui/react';
import { Database } from '../../modules/admin/Database';
import { Session } from '../../modules/admin/Session';
import { Banner } from '../../modules/admin/Banner';
import { QuickLinks } from '@app/modules/admin/QuickLinks';

export default function Page() {
    useAdmin({ required: true });
    return (
        <Box w="full">
            <Center>
                <Heading>Admin dashboard</Heading>
            </Center>
            <Center p="8">
                <SimpleGrid columns={[1, 2]} spacing={[4, 8]}>
                    <QuickLinks />
                    <Database />
                    <Session />
                    <Banner />
                </SimpleGrid>
            </Center>
        </Box>
    );
}
