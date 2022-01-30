import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { trackEvent } from '@app/util/umami/trackEvent';
import { EditIcon, StarIcon } from '@chakra-ui/icons';
import {
    Box,
    BoxProps,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Input,
    Link,
    Spacer,
    Stack,
    Text,
    useBoolean,
    useBreakpoint,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { TwitterName } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import router from 'next/router';
import { useState } from 'react';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import FakeTweet from 'fake-tweet';
import 'fake-tweet/build/index.css';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { createTwitterClient, validateTwitterAuthentication } from '@app/util/twitter/twitterHelpers';
import { getTwitterInfo } from '@app/util/database/postgresHelpers';
import { format } from 'date-fns';
import { NextSeo } from 'next-seo';
const nameEndpoint = '/api/features/twitterName';
const maxNameLength = 50;
import NextLink from 'next/link';
import { ReconnectTwitterModal } from '@app/modules/onboard/ReconnectTwitterModal';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { allFaqItems } from '@app/modules/faq/data';

interface Props {
    twitterName: TwitterName;
    twitterProfile: any;
    reAuthRequired?: boolean;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const twitterName = await prisma.twitterName.findUnique({
            where: {
                userId: session.userId,
            },
        });

        const twitterInfo = await getTwitterInfo(session.userId, true);

        const client = createTwitterClient(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

        const validate = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
        if (!validate) {
            return {
                props: {
                    twitterName: {},
                    twitterProfile: {},
                },
            };
        }

        const twitterProfile = (
            await client.accountsAndUsers.usersLookup({
                user_id: twitterInfo.providerAccountId,
            })
        )?.[0];

        if (twitterName) {
            return {
                props: {
                    twitterName,
                    twitterProfile,
                },
            };
        } else {
            if (session.accounts['twitter']) {
                // don't think we need this if check, unless we save the twitter name from the very first time they sign up
                return {
                    props: {
                        twitterName: {},
                        twitterProfile,
                    },
                };
            } else {
                return {
                    props: {
                        twitterName: {},
                        twitterProfile: {},
                    },
                };
            }
        }
    }
    return {
        props: {
            twitterName: {},
            twitterProfile: {},
        },
    };
};

// NOTE: We should potentially allow them to change what it is reverted back to. Would make it easier to handle in the UI and passing it around

export default function Page({ twitterName, twitterProfile }: Props) {
    return (
        <>
            <NextSeo
                title="Twitter Name Changer"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/name',
                    title: 'PulseBanner - Twitter Name Changer',
                    description: 'Easily attract more viewers to your stream from Twitter',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner automates your Twitter Name for free.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />

            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <FaqSection items={allFaqItems} />
            </Container>
        </>
    );
}
