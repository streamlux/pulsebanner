import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { getTwitterInfo } from '@app/util/database/postgresHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { createTwitterClient } from '@app/util/twitter/twitterHelpers';
import { trackEvent } from '@app/util/umami/trackEvent';
import { Button, Heading, useBoolean, useBreakpoint, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import { ProfilePic } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import router from 'next/router';
import { FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';

interface Props {
    profilePic: ProfilePic;
}

const profileEndpoint = '/api/features/profilePic';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const profilePic = await prisma.profilePic.findUnique({
            where: {
                userId: session.userId,
            },
        });

        return {
            props: {
                profilePic: {
                    ...profilePic,
                },
            },
        };
    }

    return {
        props: {},
    };
};

export default function Page({ profilePic }: Props) {
    // this feature is paid only...we should lock down entire page
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const toast = useToast();
    const breakpoint = useBreakpoint();

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const [isToggling, { on, off }] = useBoolean(false);

    // property ideas: border color, background color
    const getUnsavedProfilePic = () => ({});

    const saveSettings = async () => {
        if (ensureSignUp()) {
            const response = await axios.post(profileEndpoint, getUnsavedProfilePic());
        }
    };

    const refreshData = () => {
        router.replace(router.asPath);
    }

    const toggle = async () => {
        if (ensureSignUp()) {
            umami(profilePic && profilePic.enabled ? 'disable-profile' : 'enable-profile');
            on();
            await saveSettings();
            await axios.put(profileEndpoint);
            refreshData();
            off();
            if (profilePic && profilePic.enabled) {
                profilePicDisabledToggle();
            } else {
                toast({
                    title: 'Profile Picture Activated',
                    description: 'Your profile picture will be updated automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    }

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();
    const { isOpen: disableProfilePicIsOpen, onClose: disableProfilePicOnClose, onToggle: profilePicDisabledToggle } = useDisclosure();

    const showPricing: (force?: boolean) => boolean = (force?: boolean) => {
        if (force) {
            umami('show-pricing-modal');
            pricingToggle();
            return false;
        }
        return true;
    };

    const EnableButton = (
        <VStack>
            <Button
                colorScheme={profilePic && profilePic.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={profilePic && profilePic.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-profile-button')}
                disabled={profilePic && profilePic.enabled && streaming}
            >
                {profilePic && profilePic.enabled ? 'Turn off live banner' : 'Turn on live banner'}
            </Button>
            <Heading fontSize="md" w="full" textAlign="center">
                {profilePic && profilePic.enabled ? 'Your banner is enabled' : 'Live banner not enabled'}
            </Heading>
        </VStack>
    );

}
