import { IdTag } from '@app/components/table/IdTag';
import { AdminPartnerNav } from '@app/modules/admin/partner/AdminPartnerNav';
import { useAdmin } from '@app/util/hooks/useAdmin';
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';
import { formatUsd } from '@app/util/stringUtils';
import { Box, Button, Container, Select, Tab, Table, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Th, Thead, Tr, useToast, VStack } from '@chakra-ui/react';
import { CommissionStatus, Customer, Partner, PartnerInformation, PartnerInvoice, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Stripe from 'stripe';

type PartnerInvoiceList = (PartnerInvoice & {
    partner: Partner & {
        partnerInformation: PartnerInformation & {
            user: User;
        };
    };
    customer: Customer & {
        user: User;
    };
})[];

interface Props {
    completedInvoiceList: PartnerInvoiceList;
    pendingInvoiceList: PartnerInvoiceList;
    waitPeriodPartnerInvoices: PartnerInvoiceList;
    emptyInvoiceList: PartnerInvoiceList;
    rejectedInvoiceList: PartnerInvoiceList;
    allInvoiceList: PartnerInvoiceList;
    balanceTransactions: Stripe.Response<Stripe.ApiList<Stripe.CustomerBalanceTransaction>>;
    stripeBaseUrl: string;
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
                    customer: true,
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

            const balanceTransactions = await stripe.balanceTransactions.list();

            const allPartnerInvoices = (
                await prisma.partnerInvoice.findMany({
                    include: {
                        partner: {
                            include: {
                                partnerInformation: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        id: true,
                                    },
                                },
                            },
                        },
                    },
                })
            ).sort((a, b) => b.paidAt.valueOf() - a.paidAt.valueOf());

            // requery the waiting list because it could have been adjusted
            const waitPeriodPartnerInvoices = allPartnerInvoices.filter((invoice) => invoice.commissionStatus === 'waitPeriod');

            const rejectedPartnerInvoices = allPartnerInvoices.filter((invoice) => invoice.commissionStatus === 'rejected');

            // This is when there is an invoice and the user did not use any specific promo code
            const emptyPartnerInvoices = allPartnerInvoices.filter((invoice) => invoice.commissionStatus === 'none');

            const pendingPartnerInvoices = allPartnerInvoices.filter((invoice) => invoice.commissionStatus === 'pending');

            // completed invoices we can do nothing about. No-operation once they are here
            const completedPartnerInvoices = allPartnerInvoices.filter((invoice) => invoice.commissionStatus === 'complete');

            return {
                props: {
                    completedInvoiceList: completedPartnerInvoices,
                    pendingInvoiceList: pendingPartnerInvoices,
                    waitPeriodPartnerInvoices: waitPeriodPartnerInvoices,
                    emptyInvoiceList: emptyPartnerInvoices,
                    rejectedInvoiceList: rejectedPartnerInvoices,
                    allInvoiceList: allPartnerInvoices,
                    balanceTransactions,
                    stripeBaseUrl: process.env.STRIPE_DASHBOARD_BASEURL,
                },
            };
        }
    }
    return {
        props: {},
    };
};

export default function Page({
    completedInvoiceList,
    pendingInvoiceList,
    waitPeriodPartnerInvoices,
    emptyInvoiceList,
    rejectedInvoiceList,
    allInvoiceList,
    balanceTransactions,
    stripeBaseUrl,
}: Props) {
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

    const PanelLayoutHelper = (invoiceList: PartnerInvoiceList, pendingAction: boolean) => (
        <TabPanel>
            <VStack spacing={8}>
                <Box maxH="50vh" overflow={'scroll'} w="full">
                    <Table size="sm" w="full">
                        <Thead>
                            <Tr>
                                <Th>Invoice</Th>
                                <Th>Amount</Th>
                                <Th>Date</Th>
                                <Th>Partner</Th>
                                <Th>Customer</Th>
                                <Th>Commission</Th>
                                <Th>Payout Date</Th>
                                <Th>Payout Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoiceList.map((invoice) => (
                                <Tr key={invoice.id}>
                                    <Td>
                                        <IdTag copyValue={invoice.id} id="View on Stripe" url={`${stripeBaseUrl}invoices/${invoice.id}`} urlTooltip="View on Stripe" />
                                    </Td>
                                    <Td isNumeric>{formatUsd(invoice.purchaseAmount)}</Td>
                                    <Td>{invoice.paidAt.toLocaleString()}</Td>
                                    <Td>{invoice.partnerId && <IdTag id={invoice.partner?.partnerInformation.user.name ?? ''} copyValue={invoice.partnerId} />}</Td>
                                    <Td>{invoice.customer?.user.name}</Td>
                                    <Td isNumeric>{formatUsd(invoice.commissionAmount)}</Td>
                                    <Td>
                                        {' '}
                                        {invoice.balanceTransactionId
                                            ? new Date(
                                                  (balanceTransactions.data.find((bt) => bt.id === (invoice.balanceTransactionId ?? ''))?.created ?? 0) * 1000
                                              ).toLocaleString()
                                            : ''}
                                    </Td>
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
                                if (response.status === 200) {
                                    refreshData();
                                    toast({
                                        status: 'success',
                                        title: 'Completed payouts',
                                    });
                                    console.info('Individual payout completed successfully.');
                                } else {
                                    toast({
                                        status: 'error',
                                        title: 'Error doing payouts',
                                    });
                                    console.error('Individual payout failed. ', { payoutResponse: response.statusText });
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
                                if (response.status === 200) {
                                    refreshData();
                                    toast({
                                        status: 'success',
                                        title: 'Completed bulk payouts',
                                    });
                                    console.info('Bulk payout completed successfully.');
                                } else {
                                    toast({
                                        status: 'error',
                                        title: 'Error doing bulk payouts',
                                    });
                                    console.error('Bulk payout failed. ', { payoutResponse: response.statusText });
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
        <Container maxW="container.xl">
            <AdminPartnerNav />

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
        </Container>
    );
}
