import { useAdmin } from '@app/util/hooks/useAdmin';
import { AcceptanceStatus } from '@app/services/partner/PartnerService';
import prisma from '@app/util/ssr/prisma';
import { Box, Button, ButtonGroup, Container, Select, Table, Text, Tbody, Td, Th, Thead, Tr, useColorMode, useToast, VStack, HStack } from '@chakra-ui/react';
import { Partner, PartnerInformation, StripePartnerInfo, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IdTag } from '@app/components/table/IdTag';
import { AdminPartnerNav } from '@app/modules/admin/partner/AdminPartnerNav';

type PartnerList = (Partner & {
    partnerInformation: PartnerInformation & {
        user: User;
    };
    stripePartnerInfo: StripePartnerInfo;
})[];

interface PartnerProps {
    pendingPartners: PartnerList;
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
                },
            });

            if (userInfo === null || userInfo.role === 'user') {
                // return nothing
                return {
                    props: {},
                };
            }

            const pendingPartners = await prisma.partner.findMany({
                include: {
                    partnerInformation: {
                        include: {
                            user: true,
                        },
                    },
                },
                where: {
                    acceptanceStatus: 'pending',
                },
            });

            return {
                props: {
                    pendingPartners,
                    stripeBaseUrl: process.env.STRIPE_DASHBOARD_BASEURL,
                },
            };
        }
    }
    return {
        props: {},
    };
};

export default function Page({ pendingPartners, stripeBaseUrl }: PartnerProps) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();
    const { colorMode } = useColorMode();

    const [affiliateStatusMap, setAffiliateStatuMap] = useState<Record<string, AcceptanceStatus>>({});

    // need to force refresh after apply changes
    const refreshData = () => {
        router.replace(router.asPath);
    };

    const DropdownOption = ({ partner }: { partner: Partner }) => (
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

    const numChanges = pendingPartners.filter((partner) => affiliateStatusMap[partner.id] && partner.acceptanceStatus !== affiliateStatusMap[partner.id]).length;

    return (
        <Container maxW="container.xl">
            <AdminPartnerNav />
            <VStack spacing={8}>
                <HStack>
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
                    <Text>Total: {pendingPartners.length}</Text>
                </HStack>

                <Box maxH="66vh" overflow={'scroll'} w="full">
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>User</Th>
                                <Th>Disired Code</Th>
                                <Th>Email</Th>
                                <Th>First name</Th>
                                <Th>Last name</Th>
                                <Th>Notes</Th>
                                <Th>Submitted</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {pendingPartners.map((partner) => (
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
                                        {partner.partnerInformation.userId && (
                                            <IdTag id={partner.partnerInformation.user.name ?? ''} copyValue={partner.partnerInformation.userId} />
                                        )}
                                    </Td>
                                    <Td>
                                        {partner.stripePartnerInfo ? (
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
                                    <Td>{partner.firstName}</Td>
                                    <Td>{partner.lastName}</Td>
                                    <Td>{partner.notes}</Td>
                                    <Td>{partner.createdAt?.toLocaleString()}</Td>

                                    <Td>
                                        <DropdownOption partner={partner} />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </Container>
    );
}
