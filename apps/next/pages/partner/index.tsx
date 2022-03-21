import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { APIPaymentObject, PaymentPlan, productPlan } from '@app/services/payment/paymentHelpers';
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
    Table,
    TableCaption,
    Tag,
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
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useSWR from 'swr';
import { discordLink } from '@app/util/constants';
import { logger } from '@app/util/logger';
import { useForm } from 'react-hook-form';
import { AcceptanceStatus, PartnerCreateType } from '@app/services/partner/PartnerService';

interface Props {
    partnerStatus: AcceptanceStatus;
    partnerCode?: string;
    payment?: APIPaymentObject;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;


    if (session) {
        const payment = await productPlan(session.userId);
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

                if (!partnerInfo) {
                    return {
                        props: {
                            partnerStatus: AcceptanceStatus.None
                        }
                    }
                }

                return {
                    props: {
                        partnerStatus: partnerInfo.acceptanceStatus as AcceptanceStatus,
                        partnerCode: partnerInfo.partnerCode,
                        payment,
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
            payment: undefined,
        },
    };
};

export default function Page({ partnerStatus, partnerCode, payment }: Props) {
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/partner');
    const paymentPlan: PaymentPlan = payment === undefined ? 'Free' : payment.plan;

    const toast = useToast();
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
    type FormData = {
        email: string;
        firstName: string;
        lastName: string;
        partnerCodeInput: string;
        notes: string;
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const styles: BoxProps = useColorModeValue<BoxProps, BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    // order of the if statements matter
    const availableForAccount = (): boolean => {

        // let legacy partners apply
        if (payment?.partner) {
            return true;
        }

        // let admins apply
        if (session?.role === 'admin') {
            return true;
        }

        // don't let free users apply
        if (paymentPlan === 'Free') {
            return false;
        }

        // let paid users apply
        return true;
    };

    const refreshData = () => {
        router.replace(router.asPath);
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
                        support and engagement within the PulseBanner community. We love meeting creators who share our passion for empowering creators. We also prefer streamers
                        who have been streaming for at least 3 months, and have developed a pattern of consistent content creation.
                    </Text>
                    <Text>
                        <strong>Simply upgrading to a PulseBanner Membership does not make you a PulseBanner Partner.</strong> We want to make it clear that you should not upgrade
                        to a PulseBanner Membership for the sole purpose of applying to become a Partner, because that is against the spirit and intentions of the PulseBanner
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
                        PulseBanner Members that are also EMGG members will receive automatic acceptance as part of our partnership once the beta is over!{' '}
                        {/* <strong>Make sure to write that you are an EMGG member in the Notes section of the application form.</strong> */}
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
                        Credit will be added to your account as a gift card, and be used to pay your recurring subscription payments. For example, if you earn $4 in a month, and
                        you have the Personal monthly Membership ($7.99/mo), you will only be charged $2.99 for that month ($7.99 - $4.00 = $2.99). Extra credits roll over to the
                        next payment period.
                    </Text>
                    <Text>
                        Earned credit cannot be withdrawn. We hope you understand that this decision was made for a few reasons. We wanted the Partner Program to be available to
                        anyone regardless of where they live. This is a way for us to credit PulseBanner Members for work that you were already doing!
                    </Text>
                    <Text>In the future, the Partner Program may evolve to support withdraws or payouts.</Text>
                </AccordionPanel>
            </AccordionItem>
            {/* <AccordionItem>
                <AccordionButton>
                    <Text fontWeight={'semibold'} flex="1" textAlign="left">
                        How long does it take for applications to be reviewed?
                    </Text>
                    <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4}>
                    We try to review applications as fast as possible. It truly depends on how many applications we have at one time, but our goal is to respond within 5-7 business
                    days.
                </AccordionPanel>
            </AccordionItem> */}
        </Accordion>
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
                                <Link textDecoration="underline" isExternal>
                                    Partner Program Terms
                                </Link>
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
    );

    const activeText = partnerCode
        ? `I just joined the @PulseBanner Partner Program BETA! Use my code ${partnerCode} at checkout for 10% off!\n#PulseBanner\nPulseBanner.com/pricing`
        : `I just joined the @PulseBanner Partner Program BETA!\n#PulseBanner\nPulseBanner.com/pricing`;

    const FreeUserPage = () => (
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
    );

    const SuspendedPage = () => (
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
    );

    const pendingText = 'I just applied to the @PulseBanner Partner Program! Apply today to start earning with the each referral at pulsebanner.com/partner!\n\n#PulseBanner';

    const PendingPage = () => (
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
    );

    const UIDisplayMapping: Record<AcceptanceStatus, JSX.Element> = {
        none: SignUpPage(),
        active: (
            <NextLink href="/partner/dashboard" passHref>
                <Button as="a">Go to Partner Dashboard</Button>
            </NextLink>
        ),
        rejected: RejectedPage(),
        suspended: SuspendedPage(),
        pending: PendingPage(),
    };

    return (
        <>
            <NextSeo
                title="Partner Program"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/partner',
                    title: 'PulseBanner Partner Program',
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/partner" />
            <Container centerContent maxW="container.md" experimental_spaceY="4" minH="100vh">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']}>
                    <Box w="full" experimental_spaceY={4}>
                        <Center w="full">
                            <HStack>
                                <Heading textAlign={'center'}>PulseBanner Partner Program</Heading>
                                <Tag colorScheme={'blue'}>Beta</Tag>
                            </HStack>
                        </Center>
                        <Center w="full" textAlign={'center'}>
                            <Text>
                                The PulseBanner Partner Program is currently in closed beta.{' '}
                                <strong>We are not accepting applications during the beta.</strong>{' '}
                                Applications will open up to PulseBanner Members once the beta concludes.
                            </Text>
                        </Center>
                    </Box>
                </Flex>
                {((session && router.query.beta === 'yes') || partnerStatus !== AcceptanceStatus.None) && availableForAccount() && UIDisplayMapping[partnerStatus]}
                <Box w="full" pt="6">
                    {FAQSection()}
                </Box>
                {/* ( logged in AND have the beta link     OR   be a partner (or have applied) )      AND    they need to be a paid user */}
            </Container>
        </>
    );
}
