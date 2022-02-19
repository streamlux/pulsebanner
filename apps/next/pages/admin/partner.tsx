import { useAdmin } from '@app/util/hooks/useAdmin';
import { AcceptanceStatus } from '@app/util/partner/types';
import prisma from '@app/util/ssr/prisma';
import { Box, Button, Select, Tab, Table, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Th, Thead, Tr, useToast, VStack } from '@chakra-ui/react';
import { Partner } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface PartnerProps {
    activePartnerList: Partner[];
    pendingPartnerList: Partner[];
    rejectedPartnerList: Partner[];
    suspendedPartnerList: Partner[];
    allPartnerList: Partner[];
}

type MapProps = {
    partnerId: string;
    partnerStatus: AcceptanceStatus;
};

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

            const allPartners = await prisma.partner.findMany();

            return {
                props: {
                    activePartnerList: activePartners,
                    pendingPartnerList: pendingPartners,
                    rejectedPartnerList: rejectedPartners,
                    suspendedPartnerList: suspendedPartners,
                    allPartnerList: allPartners,
                },
            };
        }
    }
};

export default function Page({ activePartnerList, pendingPartnerList, rejectedPartnerList, suspendedPartnerList, allPartnerList }: PartnerProps) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();

    const [affiliateStatusMap, setAffiliateStatuMap] = useState<Record<string, AcceptanceStatus>>({});

    // need to force refresh after apply changes
    const refreshData = () => {
        router.replace(router.asPath);
    };

    const DropdownOption = (partner: Partner) => (
        <Select
            onChange={(val) => {
                setAffiliateStatuMap({ ...affiliateStatusMap, [partner.id]: val.target.value as AcceptanceStatus });
            }}
            defaultValue={partner.acceptanceStatus}
        >
            <option value={AcceptanceStatus.Active}>{AcceptanceStatus.Active}</option>
            <option value={AcceptanceStatus.Pending}>{AcceptanceStatus.Pending}</option>
            <option value={AcceptanceStatus.Rejected}>{AcceptanceStatus.Rejected}</option>
            <option value={AcceptanceStatus.Suspended}>{AcceptanceStatus.Suspended}</option>
        </Select>
    );

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
                                <Th>Status</Th>
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
                                    <Td>{DropdownOption(partner)}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
                <Button
                    onClick={async () => {
                        const response = await axios.post('/api/admin/partner/update', { affiliateStatusMap });
                        // not getting past here it seems
                        console.log('response: ', response);
                        if (response.status === 200) {
                            refreshData();
                            toast({
                                status: 'success',
                                title: 'Updated selected affiliates status',
                            });
                        } else {
                            toast({
                                status: 'error',
                                title: 'Unable to update selected affiliates status',
                            });
                        }
                    }}
                >
                    Apply changes
                </Button>
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
                    <Tab>All</Tab>
                </TabList>

                <TabPanels flexGrow={1}>
                    {PanelLayoutHelper(activePartnerList)}
                    {PanelLayoutHelper(pendingPartnerList)}
                    {PanelLayoutHelper(rejectedPartnerList)}
                    {PanelLayoutHelper(suspendedPartnerList)}
                    {PanelLayoutHelper(allPartnerList)}
                </TabPanels>
            </Tabs>
        </>
    );
}
