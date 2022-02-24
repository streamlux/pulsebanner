import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    BoxProps,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Link,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import router from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import { discordLink } from '@app/util/constants';
import { AcceptanceStatus, PartnerCreateType } from '@app/util/partner/types';
import { PartnerInvoice } from '@prisma/client';
import { logger } from '@app/util/logger';

interface Props {
    partnerStatus: AcceptanceStatus;
    partnerCode?: string;
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
        const partnerStatus = await prisma.partnerInformation.findUnique({
            where: {
                userId: session.userId,
            },
        });

        if (partnerStatus) {
            const partnerId = partnerStatus.partnerId;
            try {
                // search for the partner
                const partnerInfo = await prisma.partner.findUnique({
                    where: {
                        id: partnerId,
                    },
                });

                // get the invoices associated with the partner (what has been completed)
                const invoiceInfoPaid = await prisma.partnerInvoice.findMany({
                    where: {
                        partnerId: partnerId,
                        commissionStatus: 'complete',
                    },
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
                });

                const completedPayoutAmount = invoiceInfoPaid
                    .map((a) => a.commissionAmount)
                    .reduce((a, b) => {
                        return a + b;
                    }, 0);

                return {
                    props: {
                        partnerStatus: partnerInfo.acceptanceStatus as AcceptanceStatus,
                        partnerCode: partnerInfo.partnerCode,
                        completedPayouts: invoiceInfoPaid.length ?? 0,
                        completedPayoutAmount: completedPayoutAmount ?? 0,
                        pendingInvoices: invoiceInfoPending ?? [],
                    },
                };
            } catch (e) {
                logger.error('Error in partner page for getServerSideProps. ', { error: e });
            }
        }
    }

    return {
        props: {
            partnerStatus: AcceptanceStatus.None,
        },
    };
};

export default function Page({ partnerStatus, partnerCode, completedPayouts, completedPayoutAmount, pendingInvoices }: Props) {
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/partner');
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const toast = useToast();

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const [emailValue, setEmailValue] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [partnerCodeInput, setPartnerCode] = useState('');

    const handleEmailChange = (e) => setEmailValue(e.target.value);
    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleLastNameChange = (e) => setLastName(e.target.value);
    const handlePartnerCodeChange = (e) => setPartnerCode(e.target.value);

    const styles: BoxProps = useColorModeValue<BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    const availableForAccount = (): boolean => {
        if (paymentPlan === 'Free') {
            return false;
        }
        return true;
    };

    const validateEmailFields = (email: string): any => {
        return (
            null !==
            String(email)
                .toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        );
    };

    const validateTextFields = (): boolean => {
        return firstName.length > 0 && partnerCodeInput.length > 0;
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const submitAffiliateRequest = async () => {
        if (!ensureSignUp()) {
            return;
        }

        if (validateEmailFields(emailValue) && validateTextFields()) {
            const data: PartnerCreateType = {
                email: emailValue,
                firstName: firstName,
                lastName: lastName,
                partnerCode: partnerCodeInput.toUpperCase(),
            };

            // we are talking to our own partner program here
            // create in both tables here
            const response = await axios.post('/api/partner', data);
            if (response.status === 400) {
                toast({
                    title: 'Error processing your request',
                    description: 'We were unable to process your request. If this error persists, please reach out for technical support.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top',
                });
            }

            // if we get 409, we just report back that the code has already been taken
            if (response.status === 409) {
                toast({
                    title: 'Invalid coupon code',
                    description: 'Looks like that coupon code is already taken! Please specify a different coupon code.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top',
                });
            }
            refreshData();
        } else {
            toast({
                title: 'Partner application failed',
                description: 'Please make sure all fields are filled in and are valid entries.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
        }
    };

    const FAQSection = () => (
        <>
            <Accordion allowToggle>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                What is PulseBanner&apos;s Partner Program?
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        PulseBanner Partner Program is our way of saying thank you for being a PulseBanner member. We aim to give back to our loyal PulseBanner members and those
                        that help promote our brand. For every subscription that we get referred from you, we want to give back!
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                Who qualifies to be an Partner?
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        All PulseBanner members, or those that are subscribed to our personal or professional plan, qualify for the progam. PulseBanner members that are also EMGG
                        members receive automatic acceptance as part of our partnership! Fill out your application and send it in!
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                What benefits do affiliates receive?
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        When a new user signs up for a PulseBanner membership using your referral code, you earn some of that profit! Here&apos;s a breakdown of what you earn:
                        <ul>
                            <li>Personal monthly plan: $2 - 30%</li>
                            <li>Personal yearly plan: $6 - 10%</li>
                            <li>Professional monthly plan: $6 - 29%</li>
                            <li>Professional yearly plan: $20 - 10%</li>
                        </ul>
                        * Note, all percentages take into account transactional fees on our end. There will be no fees on your end 🙂
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                How long does it take for applications to be reviewed?
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        We try to review applications as fast as possible. It truly depends on how many applications we have at one time, but we aim for 5-7 business days.
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
    );

    // this is the page if they are looking to sign up. We should disable to submit button or show them a different page if they are not pulsebanner member
    const SignUpPage = () => (
        <>
            <Box maxW="xl" w="full">
                <Center>
                    <Flex {...styles} grow={1} p="4" my="4" rounded="md" w="fit-content" direction="column">
                        <Center w="full">
                            <Heading size="lg" textAlign={'center'}>
                                Apply Now!
                            </Heading>
                        </Center>
                        <FormControl isRequired>
                            <FormLabel my="2">Email</FormLabel>
                            <Input id="email" type="email" placeholder="Email" value={emailValue} onChange={handleEmailChange} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel my="2">First name</FormLabel>
                            <Input id="firstName" placeholder="First name" value={firstName} onChange={handleFirstNameChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel my="2">Last name</FormLabel>
                            <Input id="lastName" placeholder="Last name" value={lastName} onChange={handleLastNameChange} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel my="2">Discount Code</FormLabel>
                            <Input
                                id="partnerCodeInput"
                                placeholder="Desired partner code (subject to change and approval)"
                                value={partnerCodeInput}
                                onChange={handlePartnerCodeChange}
                            />
                        </FormControl>
                        <Flex paddingTop={'4'} justifyContent={'center'} direction={['column', 'row']}>
                            <Button size="lg" onClick={submitAffiliateRequest}>
                                Submit
                            </Button>
                        </Flex>
                    </Flex>
                </Center>
            </Box>
        </>
    );

    // this is the page if they either have been rejected from joining the program or have de-activated a premium plan.
    const ArchivedPage = () => (
        <>
            <Center w="full">
                <VStack>
                    <Heading size="md" textAlign={'center'}>
                        Sorry, your account has either been rejected for the partnership program or suspended due to no longer being a PulseBanner member.{' '}
                    </Heading>

                    <Text textAlign={'center'}>
                        Please join our discord{' '}
                        <NextLink passHref href={discordLink}>
                            <Link color="twitter.400">here</Link>
                        </NextLink>{' '}
                        if you have any questions or want more details on why your account has been suspended.
                    </Text>
                </VStack>
            </Center>
        </>
    );

    const activeText = partnerCode
        ? `I just joined the @PulseBanner Partner Program! Use my code ${partnerCode} when buying a membership for 10% off!\nPulseBanner.com/pricing\n#PulseBanner`
        : `I just joined the @PulseBanner Partner Program!\nPulseBanner.com/pricing\n#PulseBanner`;

    const ActiveAffiliatePage = () => (
        <>
            <Center>
                <VStack>
                    <Heading size="md" my="4" textAlign={'center'}>
                        You are a PulseBanner Partner! All your information, including applied and pending payouts, total referrals, and discount code can be found right here!
                    </Heading>
                    <Text pb="2" textAlign={'center'} fontSize="xl">
                        Partner Code: <b>{`${partnerCode}`}</b>
                    </Text>
                    <Stack pt="8" direction={['column', 'row']}>
                        <Text textAlign={'center'} fontSize="lg">
                            Completed Referrals: <b>{`${completedPayouts}`}</b>
                        </Text>
                        <Text textAlign={'center'} fontSize="lg">
                            Pending Referrals: <b>{`${pendingInvoices?.length ?? 0}`}</b>
                        </Text>
                    </Stack>
                    <Stack pb="8" direction={['column', 'row']}>
                        <Text textAlign={'center'} fontSize="lg">
                            Completed Payout Amount: <b>{`$${completedPayoutAmount * 0.01}`}</b>
                        </Text>
                        <Text textAlign={'center'} fontSize="lg">
                            Pending Payout Amount:{' '}
                            <b>{`$${
                                pendingInvoices
                                    ?.map((a) => a.commissionAmount)
                                    .reduce((a, b) => {
                                        return a + b;
                                    }, 0) * 0.01 ?? 0
                            }`}</b>
                        </Text>
                    </Stack>
                    <Heading fontSize="lg" textAlign={'center'}>
                        Pending Payouts
                    </Heading>
                    <VStack spacing={8} pb="8">
                        <Box maxH="50vh" overflow={'scroll'}>
                            <Table size="md">
                                <Thead>
                                    <Tr>
                                        <Th>Submitted Date</Th>
                                        <Th>Pending Commission Amount</Th>
                                        <Th>Wait Period Date</Th>
                                        <Th>Wait Period Completed</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {pendingInvoices?.map((invoice) => (
                                        <Tr key="key">
                                            <Td textAlign={'center'}>{invoice.paidAt.toDateString()}</Td>
                                            <Td textAlign={'center'}>${invoice.commissionAmount * 0.01}</Td>
                                            <Td textAlign={'center'}>{new Date(invoice.paidAt.setDate(invoice.paidAt.getDate() + 7)).toDateString()}</Td>
                                            <Td textAlign={'center'}>{invoice.commissionStatus === 'waitPeriod' ? 'no' : 'yes'}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </VStack>
                    <ShareToTwitter
                        tweetPreview={
                            <Text>
                                I just joined the <Link color="twitter.400">@PulseBanner</Link> Partner Program! Use my code <b>{`${partnerCode}`}</b> when buying a membership for
                                10% off! <Link color="twitter.500">PulseBanner.com/pricing</Link>!
                                <br />
                                <Link color="twitter.500">#PulseBanner</Link>
                            </Text>
                        }
                        tweetText={activeText}
                    />
                </VStack>
            </Center>
        </>
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

    const SuspendedPage = () => <>Testing</>;

    const pendingText = 'I just applied to the @PulseBanner Partner Program! Apply today to start earning with the each referral at pulsebanner.com/partner!\n\n#PulseBanner';

    const PendingPage = () => (
        <>
            <Center>
                <VStack>
                    <Heading size="md" my="4" textAlign={'center'}>
                        Thank you for applying to the Partner Program. We will process your application within 5-7 business days.
                    </Heading>
                    <ShareToTwitter
                        tweetPreview={
                            <Text>
                                I just applied to the <Link color="twitter.400">@PulseBanner</Link> Partner Program! Apply today to start earning with each referral at{' '}
                                <Link color="twitter.500">PulseBanner.com/partner</Link>!
                                <br />
                                <Link color="twitter.500">#PulseBanner</Link>
                            </Text>
                        }
                        tweetText={pendingText}
                    />
                </VStack>
            </Center>
        </>
    );

    const UIDisplayMapping: Record<AcceptanceStatus, JSX.Element> = {
        [AcceptanceStatus.None]: SignUpPage(),
        [AcceptanceStatus.Active]: ActiveAffiliatePage(),
        [AcceptanceStatus.Rejected]: ArchivedPage(),
        [AcceptanceStatus.Suspended]: SuspendedPage(),
        [AcceptanceStatus.Pending]: PendingPage(),
    };

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
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/pulsebanner_name_og.webp', // TODO - change image
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner offers our members the ability to earn money when they refer another user.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/partner" />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']}>
                    <Box w="full" experimental_spaceY={4}>
                        <Center w="full">
                            <Heading textAlign={'center'}>PulseBanner Partner Program</Heading>
                        </Center>
                        <Center w="full" textAlign={'center'}>
                            PulseBanner partner program is our way to give back to our users. With every new customer that uses your affiliate code at checkout, you automatically
                            receive some of the proceeds from the purchase.
                        </Center>
                    </Box>
                </Flex>
                <Box w="full">{FAQSection()}</Box>
                {availableForAccount() ? UIDisplayMapping[partnerStatus] : FreeUserPage()}
            </Container>
        </>
    );
}
