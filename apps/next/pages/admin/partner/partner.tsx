import { useAdmin } from '@app/util/hooks/useAdmin';
import prisma from '@app/util/ssr/prisma';
import {
    Box,
    Button,
    ButtonGroup,
    Container,
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
import { Partner, PartnerInformation, StripePartnerInfo, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IdTag } from '@app/components/table/IdTag';
import { AdminPartnerNav } from '@app/modules/admin/partner/AdminPartnerNav';
import { AcceptanceStatus } from '@app/services/partner/types';

type PartnerList = (Partner & {
    partnerInformation: PartnerInformation & {
        user: User;
    };
    stripePartnerInfo: StripePartnerInfo;
})[];

interface PartnerProps {
    activePartnerList: (Partner & {
        stripePartnerInfo: StripePartnerInfo;
        partnerInformation: PartnerInformation & {
            user: User;
        };
    })[];
    pendingPartnerList: PartnerList;
    rejectedPartnerList: PartnerList;
    suspendedPartnerList: PartnerList;
    allPartnerList: PartnerList;
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

            const allPartners = await prisma.partner.findMany({
                include: {
                    partnerInformation: {
                        include: {
                            user: true,
                        },
                    },
                    stripePartnerInfo: true,
                },
            });

            const activePartners = allPartners.filter((partner) => partner.acceptanceStatus === 'active');
            const pendingPartners = allPartners.filter((partner) => partner.acceptanceStatus === 'pending');
            const rejectedPartners = allPartners.filter((partner) => partner.acceptanceStatus === 'rejected');
            const suspendedPartners = allPartners.filter((partner) => partner.acceptanceStatus === 'suspended');

            const stripeBaseUrl = process.env.STRIPE_DASHBOARD_BASEURL;
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
    return {
        props: {},
    };
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
            size="sm"
            w="fit-content"
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

    const numChanges = allPartnerList.filter((partner) => affiliateStatusMap[partner.id] && partner.acceptanceStatus !== affiliateStatusMap[partner.id]).length;

    const PanelLayoutHelper = (partnerList: PartnerList) => (
        <TabPanel px="0">
            <VStack spacing={8}>
                <Box maxH="50vh" overflow={'scroll'} w="full">
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Partner</Th>
                                <Th>Promo Code</Th>
                                <Th>Email</Th>
                                <Th>Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {partnerList.map((partner) => (
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
                                    <Td>
                                        <IdTag
                                            id={partner.partnerInformation.user.name ?? ''}
                                            url={`/partner/dashboard?userId=${partner?.partnerInformation?.userId}`}
                                            copyValue={partner.id}
                                        />
                                    </Td>
                                    <Td>
                                        {partner.stripePartnerInfo?.stripePromoCode ? (
                                            <IdTag
                                                id={partner.partnerCode}
                                                copyValue={partner?.stripePartnerInfo?.stripePromoCode}
                                                url={`${stripeBaseUrl}promotion_codes/${partner?.stripePartnerInfo?.stripePromoCode}`}
                                            />
                                        ) : (
                                            partner.partnerCode
                                        )}
                                    </Td>
                                    <Td>{partner.email}</Td>
                                    <Td>{DropdownOption(partner)}</Td>
                                </Tr>
                            ))}
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
            <AdminPartnerNav />

            <Tabs colorScheme="purple" flexGrow={1}>
                <TabList>
                    <Tab>Active ({activePartnerList.length})</Tab>
                    <Tab>Rejected ({rejectedPartnerList.length})</Tab>
                    <Tab>Suspended ({suspendedPartnerList.length})</Tab>
                    <Tab>All ({allPartnerList.length})</Tab>
                </TabList>

                <TabPanels flexGrow={1}>
                    {PanelLayoutHelper(activePartnerList)}
                    {PanelLayoutHelper(rejectedPartnerList)}
                    {PanelLayoutHelper(suspendedPartnerList)}
                    {PanelLayoutHelper(allPartnerList)}
                </TabPanels>
            </Tabs>
        </Container>
    );
}
