import { useAdmin } from '@app/util/hooks/useAdmin';
import prisma from '@app/util/ssr/prisma';
import { Box, Tab, Table, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Th, Thead, Tr, useToast, VStack } from '@chakra-ui/react';
import { Partner } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface PartnerProps {
    activePartnerList: Partner[];
    pendingPartnerList: Partner[];
    rejectedPartnerList: Partner[];
    suspendedPartnerList: Partner[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const userId = session.userId;
        if (userId) {
            const userInfo = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    role: true,
                },
            });

            if (userInfo === null || userInfo.role === 'user') {
                // return nothing
                return {
                    props: {},
                };
            }

            // get the partners
            const activePartners = await prisma.partner.findMany({
                where: {
                    acceptanceStatus: 'active',
                },
            });

            const pendingPartners = await prisma.partner.findMany({
                where: {
                    acceptanceStatus: 'pending',
                },
            });

            const rejectedPartners = await prisma.partner.findMany({
                where: {
                    acceptanceStatus: 'rejected',
                },
            });

            const suspendedPartners = await prisma.partner.findMany({
                where: {
                    acceptanceStatus: 'suspended',
                },
            });

            return {
                props: {
                    activePartnerList: activePartners,
                    pendingPartnerList: pendingPartners,
                    rejectedPartnerList: rejectedPartners,
                    suspendedPartnerList: suspendedPartners,
                },
            };
        }
    }
};

export default function Page({ activePartnerList, pendingPartnerList, rejectedPartnerList, suspendedPartnerList }: PartnerProps) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();

    const PanelLayoutHelper = (partnerList: Partner[]) => (
        <TabPanel>
            <VStack spacing={8}>
                <Box maxH="50vh" overflow={'scroll'}>
                    <Table size="md">
                        <Thead>
                            <Tr>
                                <Th>Partner ID</Th>
                                <Th>Partner Code</Th>
                                <Th>Email</Th>
                                <Th>First Name</Th>
                                <Th>Last Name</Th>
                                <Th>Paypal email</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {partnerList.map((partner) => (
                                <Tr key={partner.id}>
                                    <Td>{partner.id}</Td>
                                    <Td>{partner.partnerCode}</Td>
                                    <Td>{partner.email}</Td>
                                    <Td>{partner.firstName}</Td>
                                    <Td>{partner.lastName}</Td>
                                    <Td>{partner.paypalEmail}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </TabPanel>
    );

    return (
        <>
            <Tabs colorScheme="purple" flexGrow={1}>
                <TabList>
                    <Tab>Active</Tab>
                    <Tab>Pending</Tab>
                    <Tab>Rejected</Tab>
                    <Tab>Suspended</Tab>
                </TabList>

                <TabPanels flexGrow={1}>
                    {PanelLayoutHelper(activePartnerList)}
                    {PanelLayoutHelper(pendingPartnerList)}
                    {PanelLayoutHelper(rejectedPartnerList)}
                    {PanelLayoutHelper(suspendedPartnerList)}
                </TabPanels>
            </Tabs>
        </>
    );
}
