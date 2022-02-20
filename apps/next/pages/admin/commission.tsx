import { useAdmin } from '@app/util/hooks/useAdmin';
import prisma from '@app/util/ssr/prisma';
import { Box, Button, Select, Tab, Table, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Th, Thead, Tr, useToast, VStack } from '@chakra-ui/react';
import { CommissionStatus, Partner, PartnerInvoice } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Props {
    completedInvoiceList: PartnerInvoice[];
    pendingInvoiceList: PartnerInvoice[];
    waitPeriodPartnerInvoices: PartnerInvoice[];
    emptyInvoiceList: PartnerInvoice[];
    rejectedInvoiceList: PartnerInvoice[];
    allInvoiceList: PartnerInvoice[];
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
                return {
                    props: {},
                };
            }

            // firstly, if there are any entries in waiting status that need to be in pending, we move
            const moveWaitingPartners = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.waitPeriod,
                },
            });

            moveWaitingPartners.forEach(async (invoice: PartnerInvoice) => {
                // if they have been in the waiting period for longer than 7 days, we move them then to the pending status
                if (Math.abs(invoice.paidAt.valueOf() - Date.now().valueOf()) / (1000 * 60 * 60 * 24) > 7) {
                    await prisma.partnerInvoice.update({
                        where: {
                            id: invoice.id,
                        },
                        data: {
                            commissionStatus: CommissionStatus.pending,
                        },
                    });
                }
            });

            // requery the waiting list because it could have been adjusted
            const waitPeriodPartnerInvoices = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.waitPeriod,
                },
            });

            // completed invoices we can do nothing about. No-operation once they are here
            const completedPartnerInvoices = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.complete,
                },
            });

            const pendingPartnerInvoices = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.pending,
                },
            });

            // This is when there is an invoice and the user did not use any specific promo code
            const emptyPartnerInvoices = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.none,
                },
            });

            const rejectedPartnerInvoices = await prisma.partnerInvoice.findMany({
                where: {
                    commissionStatus: CommissionStatus.rejected,
                },
            });

            const allPartnerInvoices = await prisma.partnerInvoice.findMany();

            return {
                props: {
                    completedInvoiceList: completedPartnerInvoices,
                    pendingInvoiceList: pendingPartnerInvoices,
                    waitPeriodPartnerInvoices: waitPeriodPartnerInvoices,
                    emptyInvoiceList: emptyPartnerInvoices,
                    rejectedInvoiceList: rejectedPartnerInvoices,
                    allInvoiceList: allPartnerInvoices,
                },
            };
        }
    }
};

export default function Page({ completedInvoiceList, pendingInvoiceList, waitPeriodPartnerInvoices, emptyInvoiceList, rejectedInvoiceList, allInvoiceList }: Props) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();

    // map of internal invoice id's to commissi
    const [payoutStatusMap, setPayoutStatusMap] = useState<Record<string, CommissionStatus>>({});
    const [bulkPayoutMap, setBulkPayoutMap] = useState<Record<string, CommissionStatus>>({});

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const DropdownPayoutOption = (invoice: PartnerInvoice) => (
        <Select
            onChange={(val) => {
                if ((val.target.value as CommissionStatus) === 'pendingCompletion' || (val.target.value as CommissionStatus) === 'pendingRejection') {
                    setPayoutStatusMap({ ...payoutStatusMap, [invoice.id]: val.target.value as CommissionStatus });
                }
            }}
            defaultValue={invoice.commissionStatus}
        >
            <option value={CommissionStatus.pending}>{CommissionStatus.pending}</option>
            <option value={CommissionStatus.pendingRejection}>Reject Payout</option>
            <option value={CommissionStatus.pendingCompletion}>Payout</option>
        </Select>
    );

    const PanelLayoutHelper = (invoiceList: PartnerInvoice[], pendingAction: boolean) => (
        <TabPanel>
            <VStack spacing={8}>
                <Box maxH="50vh" overflow={'scroll'}>
                    <Table size="md">
                        <Thead>
                            <Tr>
                                <Th>Invoice Id</Th>
                                <Th>Customer Id</Th>
                                <Th>Partner Id</Th>
                                <Th>Commission Amount</Th>
                                <Th>Purchase Amount</Th>
                                <Th>Invoice Paid Date</Th>
                                <Th>Commission Paid Date</Th>
                                <Th>Payout Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoiceList.map((invoice) => (
                                <Tr key={invoice.id}>
                                    <Td>{invoice.id}</Td>
                                    <Td>{invoice.customerId}</Td>
                                    <Td>{invoice.partnerId}</Td>
                                    <Td>{invoice.commissionAmount}</Td>
                                    <Td>{invoice.purchaseAmount}</Td>
                                    <Td>{invoice.paidAt.toDateString()}</Td>
                                    <Td>{invoice.commissionPaidAt === null ? null : invoice.commissionPaidAt.toDateString()}</Td>
                                    {pendingAction ? <Td>{DropdownPayoutOption(invoice)}</Td> : <Td>{invoice.commissionStatus}</Td>}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
                {pendingAction && (
                    <>
                        <Button
                            onClick={async () => {
                                const response = await axios.post('/api/admin/commission/payout', { payoutStatusMap });
                                console.log('response: ', response);
                                if (response.status === 200) {
                                    refreshData();
                                    toast({
                                        status: 'success',
                                        title: 'Completed payouts',
                                    });
                                } else {
                                    toast({
                                        status: 'error',
                                        title: 'Error doing payouts',
                                    });
                                }
                            }}
                        >
                            Apply changes
                        </Button>
                        <Button
                            onClick={async () => {
                                pendingInvoiceList.forEach((invoice: PartnerInvoice) => {
                                    if (invoice.commissionStatus === 'pending' || invoice.commissionStatus === 'pendingCompletion') {
                                        setBulkPayoutMap({ ...bulkPayoutMap, [invoice.id]: invoice.commissionStatus });
                                    }
                                });

                                const response = await axios.post('/api/admin/commission/payout', { bulkPayoutMap });
                                console.log('response from bulk payout: ', response);
                                if (response.status === 200) {
                                    refreshData();
                                    toast({
                                        status: 'success',
                                        title: 'Completed bulk payouts',
                                    });
                                } else {
                                    toast({
                                        status: 'error',
                                        title: 'Error doing bulk payouts',
                                    });
                                }
                            }}
                        >
                            Bulk Apply
                        </Button>
                    </>
                )}
            </VStack>
        </TabPanel>
    );

    return (
        <>
            <Tabs colorScheme="purple" flexGrow={1}>
                <TabList>
                    <Tab>Completed</Tab>
                    <Tab>Pending</Tab>
                    <Tab>Wait Period</Tab>
                    <Tab>Empty</Tab>
                    <Tab>Rejected</Tab>
                    <Tab>All</Tab>
                </TabList>

                <TabPanels flexGrow={1}>
                    {/** Do not include the pending completion and rejection. They should never be in this state permanently **/}
                    {PanelLayoutHelper(completedInvoiceList, false)}
                    {PanelLayoutHelper(pendingInvoiceList, true)}
                    {PanelLayoutHelper(waitPeriodPartnerInvoices, false)}
                    {PanelLayoutHelper(emptyInvoiceList, false)}
                    {PanelLayoutHelper(rejectedInvoiceList, false)}
                    {PanelLayoutHelper(allInvoiceList, false)}
                </TabPanels>
            </Tabs>
        </>
    );
}
