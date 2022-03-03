import { useAdmin } from '@app/util/hooks/useAdmin';
import { AcceptanceStatus } from '@app/util/partner/types';
import prisma from '@app/util/ssr/prisma';
import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Link,
    Select,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorMode,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { Partner, StripePartnerInfo } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import NextLink from 'next/link';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface PartnerProps {
    activePartnerList: (Partner & {
        stripePartnerInfo: StripePartnerInfo;
    })[];
    pendingPartnerList: Partner[];
    rejectedPartnerList: Partner[];
    suspendedPartnerList: Partner[];
    allPartnerList: Partner[];
    stripeBaseUrl: string;
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
                include: {
                    stripePartnerInfo: true,
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

            const stripeBaseUrl = process.env.NODE_ENV === 'development' ? 'https://dashboard.stripe.com/test/' : 'https://dashboard.stripe.com/';

            return {
                props: {
                    activePartnerList: activePartners,
                    pendingPartnerList: pendingPartners,
                    rejectedPartnerList: rejectedPartners,
                    suspendedPartnerList: suspendedPartners,
                    allPartnerList: allPartners,
                    stripeBaseUrl,
                },
            };
        }
    }
};

export default function Page({ activePartnerList, pendingPartnerList, rejectedPartnerList, suspendedPartnerList, allPartnerList, stripeBaseUrl }: PartnerProps) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();
    const { colorMode } = useColorMode();

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
            value={affiliateStatusMap[partner.id] ?? partner.acceptanceStatus}
        >
            <option value={AcceptanceStatus.Active}>{AcceptanceStatus.Active}</option>
            <option value={AcceptanceStatus.Pending}>{AcceptanceStatus.Pending}</option>
            <option value={AcceptanceStatus.Rejected}>{AcceptanceStatus.Rejected}</option>
            <option value={AcceptanceStatus.Suspended}>{AcceptanceStatus.Suspended}</option>
        </Select>
    );


    const numChanges = allPartnerList.filter((partner) => affiliateStatusMap[partner.id] && (partner.acceptanceStatus !== affiliateStatusMap[partner.id])).length;

    const PanelLayoutHelper = (
        partnerList:
            | Partner[]
            | (Partner & {
                  stripePartnerInfo: StripePartnerInfo;
              })[]
    ) => (
        <TabPanel>
            <VStack spacing={8}>
                <Box maxH="50vh" overflow={'scroll'} w="full">
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Partner ID</Th>
                                <Th>Partner Code</Th>
                                <Th>Email</Th>
                                <Th>First Name</Th>
                                <Th>Last Name</Th>
                                <Th>Info</Th>
                                <Th>Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {partnerList.map(
                                (
                                    partner: Partner & {
                                        stripePartnerInfo: StripePartnerInfo;
                                    }
                                ) => (
                                    <Tr
                                        key={partner.id}
                                        fontSize="sm"
                                        bg={
                                            affiliateStatusMap[partner.id] && affiliateStatusMap[partner.id] !== partner.acceptanceStatus
                                                ? colorMode === 'dark'
                                                    ? 'cyan.800'
                                                    : 'yellow.100'
                                                : undefined
                                        }
                                    >
                                        <Td>{partner.id}</Td>
                                        <Td>{partner.partnerCode}</Td>
                                        <Td>{partner.email}</Td>
                                        <Td>{partner.firstName}</Td>
                                        <Td>{partner.lastName}</Td>
                                        <Td>
                                            <NextLink passHref href={`${stripeBaseUrl}promotion_codes/${partner?.stripePartnerInfo?.stripePromoCode}`}>
                                                <Button size="sm" variant={'link'} as="a" target={'_blank'} rightIcon={<ExternalLinkIcon />}>
                                                    Promo code
                                                </Button>
                                            </NextLink>
                                        </Td>
                                        <Td>{DropdownOption(partner)}</Td>
                                    </Tr>
                                )
                            )}
                        </Tbody>
                    </Table>
                </Box>
                <ButtonGroup>
                    <Button
                        disabled={numChanges === 0}
                        onClick={() => {
                            axios.post('/api/admin/partner/update', { affiliateStatusMap }).then(
                                (response) => {
                                    // not getting past here it seems
                                    if (response.status === 200) {
                                        refreshData();
                                        toast({
                                            status: 'success',
                                            title: 'Updated selected partner status',
                                        });
                                    }
                                },
                                (error) => {
                                    console.log(error);
                                    toast({
                                        status: 'error',
                                        title: 'Unable to update selected partners status',
                                        description: error.response.data,
                                    });
                                }
                            );
                        }}
                    >
                        Apply {numChanges} changes
                    </Button>
                    <Button
                        disabled={numChanges === 0}
                        onClick={() => {
                            setAffiliateStatuMap({});
                        }}
                    >
                        Reset {numChanges} changes
                    </Button>
                </ButtonGroup>
            </VStack>
        </TabPanel>
    );

    return (
        <Container maxW="container.xl">
            <Tabs colorScheme="purple" flexGrow={1}>
                <TabList>
                    <Tab>Active ({activePartnerList.length})</Tab>
                    <Tab>Pending ({pendingPartnerList.length})</Tab>
                    <Tab>Rejected ({rejectedPartnerList.length})</Tab>
                    <Tab>Suspended ({suspendedPartnerList.length})</Tab>
                    <Tab>All ({allPartnerList.length})</Tab>
                </TabList>

                <TabPanels flexGrow={1}>
                    {PanelLayoutHelper(activePartnerList)}
                    {PanelLayoutHelper(pendingPartnerList)}
                    {PanelLayoutHelper(rejectedPartnerList)}
                    {PanelLayoutHelper(suspendedPartnerList)}
                    {PanelLayoutHelper(allPartnerList)}
                </TabPanels>
            </Tabs>
        </Container>
    );
}
