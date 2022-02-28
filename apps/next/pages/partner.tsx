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
    ListItem,
    Stack,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useColorMode,
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
import router, { useRouter } from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import { discordLink } from '@app/util/constants';
import { AcceptanceStatus, PartnerCreateType } from '@app/util/partner/types';
import { PartnerInvoice, Prisma } from '@prisma/client';
import { logger } from '@app/util/logger';
import { useForm } from 'react-hook-form';

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
    const router = useRouter();
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

    const availableForAccount = (): boolean => {
        // if (paymentPlan === 'Free') {
        //     return false;
        // }
        return true;
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    type FormData = {
        email: string;
        firstName: string;
        lastName: string;
        partnerCodeInput: string;
        notes: string;
    };

    const onSubmit = async (formData: FormData) => {
        if (!ensureSignUp()) {
            return;
        }
        const data: PartnerCreateType = {
            ...formData,
            partnerCode: formData.partnerCodeInput.toUpperCase(),
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
    };

    const FAQSection = () => (
        <>
            <Accordion allowToggle>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            What is the PulseBanner Partner Program?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} experimental_spaceY={4} px="4">
                        <Text>
                            The PulseBanner Partner Program is for PulseBanner Members who want to go the extra mile because they love PulseBanner and share our mission: to empower
                            creators.
                        </Text>
                        <Text>
                            We created the Partner Program as a way to give back to the many PulseBanner Members who have already been spreading the word about PulseBanner. Our
                            passionate and supportive Members have been instrumental in creating this community, and we want to show our appreciation.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            Who qualifies to be a Partner?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} experimental_spaceY={4}>
                        <Text>In order to apply to the PulseBanner Partner Program, you must be a PulseBanner Member by subscribing to one of the paid PulseBanner plans.</Text>
                        <NextLink href={'/pricing'} passHref>
                            <Button as="a" variant="link" colorScheme="twitter">
                                <Text>View PulseBanner Membership plans</Text>
                            </Button>
                        </NextLink>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            Are there any requirements to get accepted?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} experimental_spaceY={4}>
                        <Text>
                            Since the Program is designed to give back to Members who support PulseBanner and our community, applications will be reviewed based on your previous
                            support and engagement within the PulseBanner community. We love meeting creators who share our passion for empowering creators. We also prefer
                            streamers who have been streaming for at least 3 months, and have developed a pattern of consistent content creation.
                        </Text>
                        <Text>
                            Simply upgrading to a PulseBanner Membership does not make you a PulseBanner Partner. We want to make it clear that you should not upgrade to a
                            PulseBanner Membership for the sole purpose of applying to become a Partner, because that is against the spirit and intentions of the PulseBanner
                            Partner Program.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            I&#39;m an EMGG member, how do I apply?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} experimental_spaceY={4}>
                        <Text>
                            PulseBanner Members that are also EMGG members receive automatic acceptance as part of our partnership!{' '}
                            <strong>Make sure to write that you are an EMGG member in the Notes section of the application form.</strong>
                        </Text>
                        <Text>Note: EMGG members still need to be PulseBanner Members to become PulseBanner Partners.</Text>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            What benefits do Partners receive?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4} experimental_spaceY={2}>
                        <Box>
                            <Text>The perks of becoming a PulseBanner Partner include:</Text>
                            <UnorderedList>
                                <ListItem>Discount code to share with your community</ListItem>
                                <ListItem>Earn credit for every new Member who uses your code</ListItem>
                                <ListItem>Exclusive access to our partner-only content</ListItem>
                                <ListItem>More to come!</ListItem>
                            </UnorderedList>
                        </Box>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            How do earned credits work?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4} experimental_spaceY={2}>
                        <Text textAlign={'left'}>
                            When a user upgrades to a PulseBanner Membership using your discount code, a credit will be applied to your account. Here&apos;s a breakdown of what you
                            earn:
                        </Text>

                        <Center>
                            <Table variant="simple" w="fit-content">
                                <Thead>
                                    <Tr>
                                        <Th>Membership</Th>
                                        <Th>Credit (USD)</Th>
                                        <Th isNumeric>Percent</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>Personal monthly</Td>
                                        <Td>$2</Td>
                                        <Td isNumeric>30%</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Personal yearly</Td>
                                        <Td>$6</Td>
                                        <Td isNumeric>10%</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Professional monthly</Td>
                                        <Td>$6</Td>
                                        <Td isNumeric>29%</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Professional yearly</Td>
                                        <Td>$20</Td>
                                        <Td isNumeric>10%</Td>
                                    </Tr>
                                </Tbody>
                                <TableCaption>Credit amounts for each plan. Note: percentages calculated using the cost including transaction fees.</TableCaption>
                            </Table>
                        </Center>
                        <Text textAlign={'left'}>
                            Credit will be added to your account as a gift card, and be used to pay your recurring subscription payments. For example, if you earn $4 in a month,
                            and you have the Personal monthly Membership ($7.99/mo), you will only be charged $2.99 for that month ($7.99 - $4.00 = $2.99). Extra credits roll over
                            to the next payment period.
                        </Text>
                        <Text>
                            Earned credit cannot be withdrawn. We hope you understand that this decision was made for a few reasons. We wanted the Partner Program to be available
                            to anyone regardless of where they live. This is a way for us to credit PulseBanner Members for work that you were already doing!
                        </Text>
                        <Text>In the future, the Partner Program may evolve to support withdralws or payouts.</Text>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        <Text fontWeight={'semibold'} flex="1" textAlign="left">
                            How long does it take for applications to be reviewed?
                        </Text>
                        <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                        We try to review applications as fast as possible. It truly depends on how many applications we have at one time, but our goal is to respond within 5-7
                        business days.
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
    );

    // this is the page if they are looking to sign up. We should disable to submit button or show them a different page if they are not pulsebanner member
    const SignUpPage = () => (
        <Container w="full" maxW="lg">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Center w="full">
                    <Flex {...styles} grow={1} p="4" my="4" rounded="md" w="fit-content" direction="column">
                        <Box w="full">
                            <Text fontWeight={'bold'} fontSize="lg" textAlign={'center'}>
                                Apply Now!
                            </Text>
                            <Text fontSize="md" textAlign={'center'}>
                                Please read the information above before applying.
                            </Text>
                        </Box>
                        <FormControl isRequired>
                            <FormLabel my="2">Email</FormLabel>
                            <Input {...register('email', { required: true })} placeholder="Email" type="email" />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel my="2">First name</FormLabel>
                            <Input
                                {...register('firstName', {
                                    required: true,
                                    minLength: {
                                        value: 2,
                                        message: 'First name must be longer than 1 character',
                                    },
                                })}
                                placeholder="First name"
                                type="text"
                            />
                            <Text color="red.400">{errors.firstName && errors.firstName.message}</Text>
                        </FormControl>
                        <FormControl>
                            <FormLabel my="2">Last name</FormLabel>
                            <Input {...register('lastName')} placeholder="Last name" type="text" />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel my="2">Discount Code</FormLabel>
                            <Input
                                {...register('partnerCodeInput', {
                                    required: true,
                                    minLength: {
                                        value: 4,
                                        message: 'Code must be at least 4 characters',
                                    },
                                })}
                                placeholder="Desired discount code (subject to change and approval)"
                            />
                            <Text color="red.400">{errors.partnerCodeInput && errors.partnerCodeInput.message}</Text>
                        </FormControl>
                        <FormControl>
                            <FormLabel my="2">Notes</FormLabel>
                            <Textarea {...register('notes')} placeholder="Additional information" />
                        </FormControl>
                        <Text pt="2" fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                            {'By applying, you agree to the'}{' '}
                            <Box as={NextLink} href="/partner-terms" passHref>
                                <Link textDecoration="underline">Partner Program Terms</Link>
                            </Box>
                            .
                        </Text>
                        <Flex paddingTop={'4'} justifyContent={'center'} direction={['column', 'row']}>
                            <Button size="md" type="submit">
                                Submit
                            </Button>
                        </Flex>
                    </Flex>
                </Center>
            </form>
        </Container>
    );

    // this is the page if they either have been rejected from joining the program or have de-activated a premium plan.
    const RejectedPage = () => (
        <>
            <Center w="full">
                <VStack>
                    <Heading size="md" textAlign={'center'}>
                        Sorry, we did not accept your application to the PulseBanner Partner Program.
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

    const activeText = partnerCode
        ? `I just joined the @PulseBanner Partner Program BETA! Use my code ${partnerCode} at checkout for 10% off!\n#PulseBanner\nPulseBanner.com/pricing`
        : `I just joined the @PulseBanner Partner Program BETA!\n#PulseBanner\nPulseBanner.com/pricing`;

    const ActiveAffiliatePage = () => (
        <Container maxW="100vw">
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
                        <Box maxH="50vh" maxW="100vw" overflow={'scroll'}>
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
            </Center>
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

    const UIDisplayMapping: Record<AcceptanceStatus, JSX.Element> = {
        none: SignUpPage(),
        active: ActiveAffiliatePage(),
        rejected: RejectedPage(),
        suspended: SuspendedPage(),
        pending: PendingPage(),
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
            <Container centerContent maxW="container.md" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']}>
                    <Box w="full" experimental_spaceY={4}>
                        <Center w="full">
                            <Heading textAlign={'center'}>PulseBanner Partner Program BETA</Heading>
                        </Center>
                        <Center w="full" textAlign={'center'}>
                            PulseBanner partner program is our way to give back to our users. With every new customer that uses your affiliate code at checkout, you automatically
                            receive some of the proceeds from the purchase.
                        </Center>
                    </Box>
                </Flex>
                <Box w="full">{FAQSection()}</Box>
                {router.query.beta === 'true' && (availableForAccount() ? UIDisplayMapping[partnerStatus] : FreeUserPage())}
            </Container>
        </>
    );
}
