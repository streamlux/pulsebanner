import React from 'react';
import {
    Button,
    ButtonGroup,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    VStack,
    Text,
    Center,
} from '@chakra-ui/react';
import { Subscription } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { getSession, signOut } from 'next-auth/react';
import axios from 'axios';
import useSWR from 'swr';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';

const Page: NextPage = () => {
    const handleCreatePortal = async () => {
        const res = await fetch('/api/stripe/create-portal', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });

        const data = await res.json();

        const url = data.url;

        window.location.assign(url);
    };

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;
    const partner = paymentPlanResponse === undefined ? false : true;

    // delete the account
    const deleteAccount = async () => {
        console.log('deleting account');
        const sessionInfo = await getSession();
        console.log('sessionInfo: ', sessionInfo);
        if ((sessionInfo?.user as any)?.id) {
            const userId = (sessionInfo?.user as any)?.id;
            // delete all webhooks
            await axios.delete('/api/twitch/subscription');

            // call api endpoint here to delete from s3
            await axios.post(`/api/storage/delete/${userId}`);

            // call api endpoint here to delete from prisma db
            await axios.post(`/api/user/delete/${userId}`);
        }
    };

    return (
        <VStack>
            <Text fontSize="2xl" fontWeight="bold">
                <Center>If you are a paid user, you must cancel your subscription before deleting your account</Center>
            </Text>
            <Popover placement="top">
                {({ isOpen, onClose }) => (
                    <>
                        <PopoverTrigger>
                            <Button disabled={paymentPlan === 'Free' || partner}>Remove account</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody>Are you sure you want to delete your account?</PopoverBody>
                            <PopoverFooter d="flex" justifyContent="flex-end">
                                <ButtonGroup size="sm">
                                    <Button colorScheme="red" onClick={async () => await deleteAccount()}>
                                        Confirm
                                    </Button>
                                    <Button colorScheme="green" onClick={() => onClose()}>
                                        Cancel
                                    </Button>
                                </ButtonGroup>
                            </PopoverFooter>
                        </PopoverContent>
                    </>
                )}
            </Popover>
            <Button
                onClick={async () => {
                    await handleCreatePortal();
                }}
            >
                Unsubscribe
            </Button>
        </VStack>
    );
};
export default Page;
