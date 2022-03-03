import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import {
    Box,
    BoxProps,
    Button,
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
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useSWR from 'swr';
import { discordLink } from '@app/util/constants';
import { AcceptanceStatus } from '@app/util/partner/types';
import { PartnerInvoice } from '@prisma/client';
import { logger } from '@app/util/logger';
import { useForm } from 'react-hook-form';
import { InfoIcon } from '@chakra-ui/icons';
import stripe from '@app/util/ssr/stripe';
import Stripe from 'stripe';
import { getPartnerCustomerInfo } from '@app/util/partner/payoutHelpers';

interface Props {
    balance: number;
    nets: (Stripe.CustomerBalanceTransaction | Stripe.Invoice)[];
    partnerStatus: AcceptanceStatus;
    partnerCode?: string;
    completedInvoices: PartnerInvoice[];
    completedPayouts?: number;
    completedPayoutAmount?: number;
    pendingPayouts?: number;
    pendingPayoutAmount?: number;
    pendingInvoices?: PartnerInvoice[];
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

                // get the invoices associated with the partner (what has been completed)
                const invoiceInfoPaid = await prisma.partnerInvoice.findMany({
                    where: {
                        partnerId: partnerId,
                        commissionStatus: 'complete',
                    },
                });

                const customerId = await getPartnerCustomerInfo(userId);
                const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;

                const unix60DaysAgo = Math.floor(Date.now() / 1000) - 60 * 24 * 60;

                const invoices = await stripe.invoices.list({
                    customer: customerId,
                    created: {
                        gt: unix60DaysAgo,
                    }, // current time in seconds - 30 days
                });

                const balanceTransactions = await stripe.customers.listBalanceTransactions(customerId, {
                    limit: 100,
                });

                const nets = [...balanceTransactions.data.filter((bt) => bt.created > unix60DaysAgo), ...invoices.data];

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
                });

                const completedPayoutAmount = invoiceInfoPaid
                    .map((a) => a.commissionAmount)
                    .reduce((a, b) => {
                        return a + b;
                    }, 0);

                return {
                    props: {
                        nets,
                        balance: customer.balance,
                        partnerStatus: partner.acceptanceStatus as AcceptanceStatus,
                        partnerCode: partner.partnerCode,
                        completedPayouts: invoiceInfoPaid.length ?? 0,
                        completedPayoutAmount: completedPayoutAmount ?? 0,
                        pendingInvoices: invoiceInfoPending ?? [],
                        completedInvoices: invoiceInfoPaid ?? [],
                    },
                };
            } catch (e) {
                logger.error('Error in partner/dashboard getServerSideProps. ', { error: e.toString() });
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

export default function Page({ partnerStatus, partnerCode, completedPayouts, completedPayoutAmount, pendingInvoices, balance, nets, completedInvoices }: Props) {
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/partner');
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const router = useRouter();

    useEffect(() => {
        if (router.query.beta === 'true') {
            router.replace('/partner?beta=yes', '/partner', {
                shallow: true,
            });
        }
    }, [router.query.beta, router]);

    const { colorMode } = useColorMode();
    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const styles: BoxProps = useColorModeValue<BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    const formatUsd = (amount: number, negate?: boolean) => {
        return `$${(amount / (100 * (negate ? -1 : 1))).toFixed(2)}`;
    };

    const availableForAccount = (): boolean => {
        if (session?.role === 'admin') {
            return true;
        }
        if (paymentPlan === 'Free' || paymentPlanResponse.partner) {
            return false;
        }
        return true;
    };

    const activeText = partnerCode
        ? `I just joined the @PulseBanner Partner Program BETA! Use my code ${partnerCode} at checkout for 10% off!\n#PulseBanner\nPulseBanner.com/pricing`
        : `I just joined the @PulseBanner Partner Program BETA!\n#PulseBanner\nPulseBanner.com/pricing`;

    const ActiveAffiliatePage = () => (
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
                                        <StatLabel>Credit balance</StatLabel>
                                        <StatNumber>{formatUsd(balance, true)}</StatNumber>
                                    </Stat>
                                </Flex>
                            </Box>
                            <Box experimental_spaceY={2}>
                                <Flex>
                                    <Stat w="50%">
                                        <StatLabel>Pending referrals</StatLabel>
                                        <StatNumber>{pendingInvoices.length ?? 0}</StatNumber>
                                    </Stat>
                                    <Stat w="50%">
                                        <StatLabel>Pending credits</StatLabel>
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
                                        <StatLabel>Completed referrals</StatLabel>
                                        <StatNumber>{completedPayouts}</StatNumber>
                                    </Stat>
                                    <Stat w="50%">
                                        <StatLabel>Earned credits</StatLabel>
                                        <StatNumber>{formatUsd(completedPayoutAmount)}</StatNumber>
                                    </Stat>
                                </Flex>
                            </Box>
                        </Box>
                    </Box>
                </Center>

                <Box py="12" experimental_spaceY={4} w="full">
                    <Box overflow={'scroll'} w="full" minH="48" experimental_spaceY={4}>
                        <Heading size="md">Pending Referrals</Heading>
                        <Text maxW={[undefined, '66%']}>
                            Referrals are pending until they pass our refund period (7 days). Once 7 days pass, the wait period is over and we will apply the credit to your
                            account.
                        </Text>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>
                                        <HStack>
                                            <Text>ID</Text>
                                            <Center as="span">
                                                <Tooltip w="min" label="Unique ID of the transaction">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Center>
                                        </HStack>
                                    </Th>
                                    <Th>
                                        <HStack w="min">
                                            <Text>Transaction Date</Text>
                                            <Center as="span">
                                                <Tooltip label="Date the transaction was made">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Center>
                                        </HStack>
                                    </Th>
                                    <Th>
                                        <HStack w="min">
                                            <Text>Pending Commission Amount</Text>
                                            <Center as="span">
                                                <Tooltip label="The amount you will earn (USD)">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Center>
                                        </HStack>
                                    </Th>
                                    <Th>
                                        <HStack>
                                            <Text>Wait Period End</Text>
                                            <Center as="span">
                                                <Tooltip label="Date the wait period ends">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Center>
                                        </HStack>
                                    </Th>
                                    <Th>
                                        <HStack>
                                            <Text>Wait Period Complete?</Text>

                                            <Center as="span">
                                                <Tooltip label="Has the wait period ended">
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
                                        <Td textAlign={'center'}>{invoice.id}</Td>
                                        <Td textAlign={'center'}>{invoice.paidAt.toDateString()}</Td>
                                        <Td textAlign={'center'}>${invoice.commissionAmount * 0.01}</Td>
                                        <Td textAlign={'center'}>{new Date(invoice.paidAt.setDate(invoice.paidAt.getDate() + 7)).toDateString()}</Td>
                                        <Td textAlign={'center'}>{invoice.commissionStatus === 'waitPeriod' ? 'no' : 'yes'}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        {pendingInvoices.length === 0 && (
                            <Center w="full" my="4">
                                <Text>Your referrals will show up here!</Text>
                            </Center>
                        )}
                    </Box>
                    <Box maxH="50vh" maxW="100vw" overflow={'scroll'} w="full" minH="48" experimental_spaceY={4}>
                        <Heading size="md">Completed Referrals</Heading>
                        <Text>Referral credits that have been applied to your account balance.</Text>
                        <Table size="md">
                            <Thead>
                                <Tr>
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
                                            <Text w="full" textAlign={'right'}>
                                                Amount
                                            </Text>
                                            <Center as="span">
                                                <Tooltip label="The amount you will earn (USD)">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Center>
                                        </HStack>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {nets
                                    .filter((net) => net.object === 'customer_balance_transaction')
                                    ?.map((net: Stripe.CustomerBalanceTransaction) => (
                                        <Tr key="key">
                                            <Td align="left">{net.metadata.invoiceId}</Td>
                                            <Td>{new Date(net.created * 1000).toLocaleString()}</Td>
                                            <Td isNumeric>${net.amount * -0.01}</Td>
                                        </Tr>
                                    ))}
                            </Tbody>
                        </Table>
                        {nets.filter((net) => net.object === 'customer_balance_transaction').length === 0 && (
                            <Center w="full" my="4">
                                <Text>Your completed referrals will show up here!</Text>
                            </Center>
                        )}
                    </Box>
                    <Box overflow={'scroll'} w="full" experimental_spaceY={4}>
                        <Heading size="md">Account Balance History</Heading>
                        <Text>Shows the last 60 days of account balance history.</Text>
                        <Table variant="simple" w="full">
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Event</Th>
                                    <Th isNumeric>Credit Balance</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {nets.map((net) => (
                                    <Tr key={net.id}>
                                        <Td>{new Date(net.created * 1000).toLocaleString()}</Td>
                                        {net.object === 'customer_balance_transaction' ? (
                                            <>
                                                <Td>Credit ({net.metadata.invoiceId})</Td>
                                                <Td isNumeric>${(net.ending_balance / -100).toFixed(2)}</Td>
                                                <Td isNumeric fontWeight={'bold'} color="green.400">
                                                    +${(net.amount / -100).toFixed(2)}
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
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>

                <ShareToTwitter
                    tweetPreview={
                        <Text>
                            I just joined the <Link color="twitter.400">@PulseBanner</Link> Partner Program BETA! Use my code <b>{`${partnerCode}`}</b> at checkout for 10% off!
                            <br />
                            <Link color="twitter.500">#PulseBanner</Link>
                            <br />
                            <Link color="twitter.500">PulseBanner.com/pricing</Link>
                        </Text>
                    }
                    tweetText={activeText}
                />
            </VStack>
        </Container>
    );

    const FreeUserPage = () => (
        <>
            <Center w="full">
                <VStack my="4">
                    <Heading size="md" textAlign={'center'}>
                        Interested in becoming part of the Partner Program? Become a PulseBanner member and apply today!
                    </Heading>
                    <HStack>
                        <Text textAlign={'center'}>Check out our pricing page 👉 </Text>
                        <NextLink passHref href="/pricing">
                            <Link color="blue.300" fontWeight={'bold'} fontSize={'md'}>
                                PulseBanner Pricing
                            </Link>
                        </NextLink>
                    </HStack>
                </VStack>
            </Center>
        </>
    );

    const SuspendedPage = () => (
        <>
            <Center w="full">
                <VStack>
                    <Heading size="md" textAlign={'center'}>
                        You are no longer a PulseBanner Partner. This is a result of you no longer being a PulseBanner Member.
                    </Heading>

                    <Text textAlign={'center'}>
                        Please join our Discord{' '}
                        <NextLink passHref href={discordLink}>
                            <Link color="twitter.400">here</Link>
                        </NextLink>{' '}
                        if you have any questions or want more details on why your account has been suspended.
                    </Text>
                </VStack>
            </Center>
        </>
    );

    const pendingText = 'I just applied to the @PulseBanner Partner Program! Apply today to start earning with the each referral at pulsebanner.com/partner!\n\n#PulseBanner';

    const PendingPage = () => (
        <>
            <Center>
                <VStack>
                    <Heading size="md" my="4" textAlign={'center'}>
                        Thank you for applying to the Partner Program. We will process your application within 5-7 business days.
                    </Heading>
                    {/* <ShareToTwitter
                        tweetPreview={
                            <Text>
                                I just applied to the <Link color="twitter.400">@PulseBanner</Link> Partner Program! Apply today to start earning with each referral at{' '}
                                <Link color="twitter.500">PulseBanner.com/partner</Link>!
                                <br />
                                <Link color="twitter.500">#PulseBanner</Link>
                            </Text>
                        }
                        tweetText={pendingText}
                    /> */}
                </VStack>
            </Center>
        </>
    );

    return (
        <>
            <NextSeo
                title="Twitter "
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/partner',
                    title: 'PulseBanner Partner Program',
                    description: 'Easily earn money back the more users you refer to PulseBanner memberships',
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/partner" />
            <Container centerContent maxW="container.xl" experimental_spaceY="4" minH="100vh">
                {/* ( logged in AND have the beta link     OR   be a partner (or have applied) )      AND    they need to be a paid user */}
                {((session && router.query.beta === 'yes') || partnerStatus !== AcceptanceStatus.None) && availableForAccount() && ActiveAffiliatePage()}
            </Container>
        </>
    );
}
