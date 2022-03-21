import prisma from '@app/util/ssr/prisma';
import {
    Box,
    Center,
    Container,
    Flex,
    Heading,
    HStack,
    Link,
    Stat,
    StatLabel,
    StatNumber,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorMode,
    VStack,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import React from 'react';
import { AcceptanceStatus, PartnerService } from '@app/services/partner/PartnerService';
import { CommissionStatus, PartnerInvoice } from '@prisma/client';
import { logger } from '@app/util/logger';
import { InfoIcon } from '@chakra-ui/icons';
import stripe from '@app/util/ssr/stripe';
import Stripe from 'stripe';
import { formatUsd } from '@app/util/stringUtils';

interface Props {
    balance: number;
    nets: (Stripe.Invoice | PartnerInvoice)[];
    partnerStatus: AcceptanceStatus;
    partnerCode?: string;
    completedInvoices: PartnerInvoice[];
    completedPayouts?: number;
    completedPayoutAmount?: number;
    pendingPayouts?: number;
    pendingPayoutAmount?: number;
    pendingInvoices?: PartnerInvoice[];
    balanceTransactions: Record<string, Stripe.CustomerBalanceTransaction>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        // allow admins to view any users partner dashboard
        const userId = session.user.role !== 'admin' ? session.user.id : context.query.userId ?? session.user.id;

        const partnerInfo = await prisma.partnerInformation.findUnique({
            where: {
                userId,
            },
        });
        const partnerId = partnerInfo?.partnerId;

        if (partnerId) {
            try {
                // search for the partner
                const partner = await prisma.partner.findUnique({
                    where: {
                        id: partnerId,
                    },
                    include: {
                        partnerInformation: {
                            include: {
                                user: {
                                    include: {
                                        customer: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (partner?.acceptanceStatus !== 'active') {
                    return {
                        redirect: {
                            destination: '/partner',
                            permanent: false,
                        },
                    };
                }

                // get the invoices associated with the partner (what has been completed)
                const invoiceInfoPaid = await prisma.partnerInvoice.findMany({
                    where: {
                        partnerId: partnerId,
                        commissionStatus: 'complete',
                    },
                    orderBy: {
                        paidAt: 'desc',
                    },
                });

                const customerId = await PartnerService.getPartnerCustomerInfo(userId);
                if (!customerId) {
                    return {
                        redirect: {
                            destination: '/partner',
                            permanent: false,
                        },
                    };
                }
                const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;

                const unix60DaysAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60;

                const invoices = await stripe.invoices.list({
                    customer: customerId,
                    created: {
                        gt: unix60DaysAgo,
                    }, // current time in seconds - 30 days
                });

                const balanceTransactions = (
                    await stripe.customers.listBalanceTransactions(customerId, {
                        limit: 100,
                    })
                ).data.reduce((a, v) => ({ ...a, [v.id]: v }), {});

                const nets = [...invoiceInfoPaid, ...invoices.data].sort((a: any, b: any) => {
                    const aDate = a.paidAt ?? a.created;
                    const bDate = b.paidAt ?? b.created;

                    return bDate - aDate;
                });

                const invoiceInfoPending = await prisma.partnerInvoice.findMany({
                    where: {
                        partnerId: partnerId,
                        OR: [
                            {
                                commissionStatus: {
                                    equals: 'waitPeriod',
                                },
                            },
                            {
                                commissionStatus: {
                                    equals: 'pending',
                                },
                            },
                        ],
                    },
                    orderBy: {
                        paidAt: 'desc',
                    },
                });

                const completedPayoutAmount = invoiceInfoPaid
                    ?.map((a) => a.commissionAmount)
                    .reduce((a, b) => {
                        return a + b;
                    }, 0);

                return {
                    props: {
                        nets,
                        balance: customer.balance,
                        partnerStatus: partner?.acceptanceStatus as AcceptanceStatus,
                        partnerCode: partner?.partnerCode,
                        completedPayouts: invoiceInfoPaid?.length ?? 0,
                        completedPayoutAmount: completedPayoutAmount ?? 0,
                        pendingInvoices: invoiceInfoPending ?? [],
                        completedInvoices: invoiceInfoPaid ?? [],
                        balanceTransactions,
                    },
                };
            } catch (e) {
                logger.error('Error in partner/dashboard getServerSideProps. ', { error: (e as any).toString() });
            }
        } else {
            return {
                redirect: {
                    destination: '/partner',
                    permanent: false,
                },
            };
        }
    }

    return {
        props: {
            partnerStatus: AcceptanceStatus.None,
        },
    };
};

export default function Page({
    balanceTransactions,
    partnerStatus,
    partnerCode,
    completedPayouts,
    completedPayoutAmount = 0,
    pendingInvoices,
    balance,
    nets,
    completedInvoices,
}: Props) {
    const { colorMode } = useColorMode();

    const referralStatus: Record<CommissionStatus, string> = {
        complete: 'Completed',
        none: 'None',
        pending: 'Pending',
        pendingCompletion: 'Pending completion',
        waitPeriod: 'Refund period',
        pendingRejection: 'Pending Rejection',
        rejected: 'Rejected',
    };

    const activeText = partnerCode
        ? `I just joined the @PulseBanner Partner Program BETA! Use my code ${partnerCode} at checkout for 10% off!\n#PulseBanner\nPulseBanner.com/pricing`
        : `I just joined the @PulseBanner Partner Program BETA!\n#PulseBanner\nPulseBanner.com/pricing`;

    return (
        <>
            <NextSeo title="Partner Dashboard" nofollow noindex />
            <Container centerContent maxW="container.xl" experimental_spaceY="4" minH="100vh">
                <Container maxW="container.lg">
                    <Center mb="8">
                        <Box maxW={['95vw']} background={colorMode === 'dark' ? 'gray.700' : 'blackAlpha.200'} mx="2" py="2" rounded="md">
                            <Center id="nav-links" fontSize={['sm', 'md']} px="5vw">
                                <Wrap spacing={['4', '8', '8', '8']}>
                                    <WrapItem>
                                        <NextLink href="/partner/welcome" passHref>
                                            <Link>Welcome</Link>
                                        </NextLink>
                                    </WrapItem>
                                    <WrapItem>
                                        <NextLink href="/partner/dashboard" passHref>
                                            <Link fontWeight={'bold'} textDecoration="underline">
                                                Dashboard
                                            </Link>
                                        </NextLink>
                                    </WrapItem>
                                </Wrap>
                            </Center>
                        </Box>
                    </Center>
                    <VStack spacing={8}>
                        {/* <Heading size="xl">Partner Dashboard</Heading> */}
                        <Text fontSize="xl" maxW="container.md" my="4" textAlign={'center'}>
                            Welcome to your Partner Dashboard. Your Dashboard has information including your discount code, total credits and referrals, and pending and completed
                            referrals.
                        </Text>
                        <Center minW={['80vw', 'container.md']} mt="8">
                            <Box minW={['100%', '50%']}>
                                <Box experimental_spaceY={8}>
                                    <Box experimental_spaceY={2}>
                                        <Flex>
                                            <Stat w="50%">
                                                <StatLabel>Discount code</StatLabel>
                                                <StatNumber>{partnerCode}</StatNumber>
                                            </Stat>
                                            <Stat w="50%">
                                                <StatLabel>
                                                    <HStack>
                                                        <Text>Credit balance</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Current balance of credits on your account">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </StatLabel>
                                                <StatNumber>{formatUsd(balance, true)}</StatNumber>
                                            </Stat>
                                        </Flex>
                                    </Box>
                                    <Box experimental_spaceY={2}>
                                        <Flex>
                                            <Stat w="50%">
                                                <StatLabel>
                                                    <HStack>
                                                        <Text>Pending referrals</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Referrals within the refund period or waiting to be completed by a staff member">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </StatLabel>
                                                <StatNumber>{pendingInvoices?.length ?? 0}</StatNumber>
                                            </Stat>
                                            <Stat w="50%">
                                                <StatLabel>
                                                    <HStack>
                                                        <Text>Pending credits</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Total credits for pending referrals">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </StatLabel>
                                                <StatNumber>
                                                    {formatUsd(
                                                        pendingInvoices
                                                            ?.map((a) => a.commissionAmount)
                                                            .reduce((a, b) => {
                                                                return a + b;
                                                            }, 0) ?? 0
                                                    )}
                                                </StatNumber>
                                            </Stat>
                                        </Flex>
                                    </Box>
                                    <Box experimental_spaceY={2}>
                                        <Flex>
                                            <Stat w="50%">
                                                <StatLabel>
                                                    <HStack>
                                                        <Text>Completed referrals</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Total referrals completed all time">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </StatLabel>
                                                <StatNumber>{completedPayouts}</StatNumber>
                                            </Stat>
                                            <Stat w="50%">
                                                <StatLabel>
                                                    <HStack>
                                                        <Text>Earned credits</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Total credits earned from referrals all time">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </StatLabel>
                                                <StatNumber>{formatUsd(completedPayoutAmount)}</StatNumber>
                                            </Stat>
                                        </Flex>
                                    </Box>
                                </Box>
                            </Box>
                        </Center>

                        <VStack py="12" spacing={16} w="full">
                            <Box overflow={'scroll'} w="full" experimental_spaceY={4}>
                                <Heading size="md">Pending Referrals</Heading>
                                <Text maxW={['unset', '66%']}>
                                    Referrals are pending until they pass our refund period (7 days). Once 7 days pass, the refund period is over and we will apply the credit to
                                    your account.
                                </Text>
                                <Box overflow={'scroll'} maxH="30vh">
                                    <Table size="sm" w="full">
                                        <Thead>
                                            <Tr>
                                                <Th>
                                                    <HStack w="min">
                                                        <Text>Date</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Date the transaction was made">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                                <Th isNumeric>
                                                    <HStack w="min">
                                                        <Text>Credit</Text>
                                                        <Center as="span">
                                                            <Tooltip label="The amount of credits you will earn (USD)">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                                <Th>
                                                    <HStack>
                                                        <Text>Refund Period End</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Date the refund period ends">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                                <Th>
                                                    <HStack>
                                                        <Text>Status</Text>
                                                    </HStack>
                                                </Th>
                                                <Th>
                                                    <HStack>
                                                        <Text>Referral ID</Text>
                                                        <Center as="span">
                                                            <Tooltip w="min" label="Unique ID of the transaction">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {pendingInvoices?.map((invoice) => (
                                                <Tr key="key">
                                                    <Td>{invoice.paidAt.toLocaleString()}</Td>
                                                    <Td isNumeric>{formatUsd(invoice.commissionAmount)}</Td>
                                                    <Td>{new Date(new Date(invoice.paidAt).setDate(invoice.paidAt.getDate() + 7)).toLocaleString()}</Td>
                                                    <Td>{referralStatus[invoice.commissionStatus]}</Td>
                                                    <Td>{invoice.id}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                    {!pendingInvoices?.length && (
                                        <Center w="full" my="4">
                                            <Text>Your referrals will show up here!</Text>
                                        </Center>
                                    )}
                                </Box>
                            </Box>
                            <Box maxH="50vh" w="full" experimental_spaceY={4}>
                                <Heading size="md">Completed Referrals</Heading>
                                <Text>Referral credits that have been applied to your account balance.</Text>
                                <Box overflow={'scroll'} maxH="30vh">
                                    <Table size="sm" w="full">
                                        <Thead>
                                            <Tr>
                                                <Th>
                                                    <HStack>
                                                        <Text>Credit Date</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Date credit was applied to your account">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                                <Th>
                                                    <HStack>
                                                        <Text>Payout ID</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Unique ID associated with each referral">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>

                                                <Th>
                                                    <HStack>
                                                        <Text w="full" textAlign={'right'}>
                                                            Amount
                                                        </Text>
                                                        <Center as="span">
                                                            <Tooltip label="Credits earned for referral (USD)">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                                <Th>
                                                    <HStack>
                                                        <Text>Referral ID</Text>
                                                        <Center as="span">
                                                            <Tooltip label="Unique ID associated with each referral">
                                                                <InfoIcon />
                                                            </Tooltip>
                                                        </Center>
                                                    </HStack>
                                                </Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {completedInvoices?.map((invoice) => {
                                                const bt = invoice.balanceTransactionId ? balanceTransactions[invoice.balanceTransactionId] : undefined;
                                                return (
                                                    <Tr key="key">
                                                        <Td>{new Date((bt?.created ?? 0) * 1000).toLocaleString()}</Td>
                                                        <Td align="left">{invoice.balanceTransactionId}</Td>
                                                        <Td isNumeric>{formatUsd(invoice.commissionAmount)}</Td>
                                                        <Td align="left">{invoice.id}</Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>

                                    {!completedInvoices.length && (
                                        <Center w="full" my="4">
                                            <Text>Your completed referrals will show up here!</Text>
                                        </Center>
                                    )}
                                </Box>
                            </Box>
                            <Box w="full" experimental_spaceY={4}>
                                <Heading size="md">Account Balance History</Heading>
                                <Text maxW={['unset', '66%']}>Shows the last 60 days of account balance history. Including credit payouts, and subscription payments.</Text>
                                <Box overflow={'scroll'}>
                                    <Table variant="simple" w="full" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Event</Th>
                                                <Th isNumeric>Credit Balance</Th>
                                                <Th isNumeric>Amount</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {nets.map((net: any) => {
                                                const bt = net.balanceTransactionId ? balanceTransactions[net.balanceTransactionId] : undefined;
                                                const p = net as PartnerInvoice;
                                                const i = net as Stripe.Invoice;
                                                return (
                                                    <Tr key={net.id}>
                                                        <Td>{new Date((i.created ?? bt?.created) * 1000).toLocaleString()}</Td>
                                                        {net.object !== 'invoice' && bt ? (
                                                            <>
                                                                <Td>Credit ({p.id})</Td>
                                                                <Td isNumeric>${(bt.ending_balance / -100).toFixed(2)}</Td>
                                                                <Td isNumeric fontWeight={'bold'} color="green.400">
                                                                    +{formatUsd(bt.amount, true)}
                                                                </Td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Td>{net.subscription ? 'Subscription payment' : 'Payment'}</Td>
                                                                <Td isNumeric>${(net.ending_balance / 100).toFixed(2)}</Td>
                                                                <Td isNumeric fontWeight={'bold'} color="red.400">
                                                                    -${(net.amount_paid / 100).toFixed(2)}
                                                                </Td>
                                                            </>
                                                        )}
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </VStack>
                    </VStack>
                </Container>
            </Container>
        </>
    );
}
