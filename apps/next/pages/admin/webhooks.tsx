import React, { useState } from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import {
    Box,
    Center,
    Heading,
    Input,
    FormControl,
    Button,
    Text,
    Container,
    Stack,
    VStack,
    Flex,
    Spacer,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getAccountsById } from '@app/util/getAccountsById';
import { useRouter } from 'next/router';
import axios from 'axios';
import { User } from '@prisma/client';
import { TwitchSubscriptionService } from '@app/services/TwitchSubscriptionService';
import { Subscription } from '@app/types/twitch';

type PageProps = {
    userId?: string;
    user?: User;
    subscriptions: Subscription[];
};

export const getServerSideProps: GetServerSideProps<PageProps | any> = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    const userId = context.query.userId;
    const twitchSub = new TwitchSubscriptionService();

    if (typeof userId === 'string' && userId !== '') {
        try {
            const accounts = await getAccountsById(userId);
            const twitchUserId = accounts['twitch'].providerAccountId;

            const twitchSub = new TwitchSubscriptionService();
            const subscriptions = await twitchSub.getSubscriptions(twitchUserId);

            return {
                props: {
                    userId,
                    subscriptions,
                },
            };
        } catch (e) {
            return {
                props: {
                    subscriptions: await twitchSub.getSubscriptions(),
                },
            };
        }
    } else {
        return {
            props: {
                subscriptions: await twitchSub.getSubscriptions(),
            },
        };
    }
};

export default function Page({ userId, subscriptions }: PageProps) {
    useAdmin({ required: true });
    const toast = useToast();

    const router = useRouter();

    const [userIdInput, setUserIdInput] = useState(userId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [subscription, setSubscription] = useState<Subscription>();

    const submit = () => {
        router.push(`?userId=${userIdInput}`);
    };

    const refreshSubscriptions = async (userId: string) => {
        await axios.post(`/api/admin/subscriptions/update?userId=${userId}`);
    };

    return (
        <Container maxW="container.xl">
            <Center>
                <Heading>Webhooks dashboard</Heading>
            </Center>
            <Drawer size="lg" isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Subscription details</DrawerHeader>

                    <DrawerBody>
                        <Box as="pre" whiteSpace="pre-wrap" maxW="full" wordBreak="break-all" overflow="auto">
                            {JSON.stringify(subscription, null, 2)}
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
            <Center p="8">
                <VStack spacing={8}>
                    <Flex w="full">
                        <Spacer />
                        <FormControl maxW="lg">
                            <Stack direction={['column', 'row']} maxW="lg">
                                <Input placeholder="User ID" w="full" defaultValue={userId} onChange={(e) => setUserIdInput(e.target.value)} id="userId" type="userId" />
                                <Button onClick={submit}>Submit</Button>
                            </Stack>
                        </FormControl>
                    </Flex>
                    <Flex>
                        <Button
                            onClick={async () => {
                                if (userId) {
                                    await refreshSubscriptions(userId);
                                    toast({
                                        status: 'success',
                                        title: 'Updating Twitch subscriptions',
                                    });
                                } else {
                                    toast({
                                        status: 'error',
                                        title: 'Must have userId',
                                    });
                                }
                            }}
                        >
                            Update Twitch subscriptions for user
                        </Button>
                    </Flex>
                    <Box maxW="90vw" overflowY={'scroll'}>
                        <Flex px="4">
                            <Spacer />
                            <Text color="gray.300">Count: {subscriptions.length}</Text>
                        </Flex>
                        <Box maxH="50vh" overflow={'scroll'}>
                            <Table size="md">
                                <Thead>
                                    <Tr>
                                        <Th>Twitch User id</Th>
                                        <Th>Type</Th>
                                        <Th>Status</Th>
                                        <Th>Version</Th>
                                        <Th>Created at</Th>
                                        <Th>Details</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {subscriptions.map((subscription) => (
                                        <Tr key={subscription.id}>
                                            <Td>{subscription.condition.broadcaster_user_id}</Td>
                                            <Td>{subscription.status}</Td>
                                            <Td>{subscription.type}</Td>
                                            <Td>{subscription.version}</Td>
                                            <Td>{new Date(subscription.created_at).toLocaleString()}</Td>
                                            <Td>
                                                <Button
                                                    onClick={() => {
                                                        setSubscription(subscription);
                                                        onOpen();
                                                    }}
                                                >
                                                    Details
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>
                </VStack>
            </Center>
        </Container>
    );
}
