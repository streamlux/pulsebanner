import React from 'react';
import { Box, Center, Text, Container, Heading, Button, ButtonGroup, Alert, AlertDescription, AlertIcon, AlertTitle, VStack } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsResult, NextPage } from 'next';
import NextLink from 'next/link';
import { discordLink, twitterLink } from '@app/util/constants';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import Confetti from '@app/components/confetti/Confetti';
import { getSession } from 'next-auth/react';
import prisma from '@app/util/ssr/prisma';
import { GiftPurchase, Price, Product } from '@prisma/client';
import { Card } from '@app/components/Card';
import Stripe from 'stripe';
import { getPromoCodeById, isPromoCodeRedeemed } from '@app/services/stripe/gift/redeemHelpers';
import { getGiftRedemptionUrl } from '@app/services/stripe/gift/getGiftRedemptionUrl';
import { GiftSummary } from '@app/components/gifts/GiftSummary';
import { Gift } from '@app/components/gifts/Gift';
import { GiftInfo } from '@app/components/gifts/types';

/**
 * Gift Purchase Summary page
 *
 * What this page is used for:
 * 1. Page we redirect users to after they purchase a gift. This will grab the users most recent
 *   checkout session and display the gift purchase summary.
 * 2. Page we link to in gift purchase summary emails. We use the `cs` query parameter to pass the
 *    checkout session ID to the page. The page then displays the gift purchase summary for that checkout session.
 */

type Props = {
    gifts: GiftInfo[];
    allGiftPurchases: { checkoutSessionId: string; createdAt: Date }[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    const redirectToHomePage: GetServerSidePropsResult<any> = {
        redirect: {
            destination: '/',
            permanent: false,
        },
        props: {},
    };

    if (!session) {
        return redirectToHomePage;
    }

    const csId = context.query.cs as string;

    const getLatestCheckoutSessionId = async () => {
        const result = await prisma.giftPurchase.findFirst({
            where: {
                purchaserUserId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                checkoutSessionId: true,
            },
        });
        return result?.checkoutSessionId;
    };

    const checkoutSessionId = csId ?? (await getLatestCheckoutSessionId());

    if (!checkoutSessionId) {
        return redirectToHomePage;
    }

    // get the most recent gift purchased by this user
    const mostRecentGiftPurchases: GiftPurchase[] = await prisma.giftPurchase.findMany({
        where: {
            purchaserUserId: session.user.id,
            checkoutSessionId: checkoutSessionId,
        },
    });

    const allGiftPurchases = await prisma.giftPurchase.findMany({
        where: {
            purchaserUserId: session.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            checkoutSessionId: true,
            createdAt: true,
        },
        distinct: ['checkoutSessionId'],
    });

    const gifts: GiftInfo[] = [];

    for (const giftPurchase of mostRecentGiftPurchases) {
        // use Stripe API to get the promo code using the promotion code ID from the gift purchase
        const promoCode: Stripe.PromotionCode | undefined = await getPromoCodeById(giftPurchase.promoCodeId);
        if (!promoCode) {
            return redirectToHomePage;
        }

        const price: Price & { product: Product } = await prisma.price.findUnique({
            where: {
                id: giftPurchase.priceId,
            },
            include: {
                product: true,
            },
            rejectOnNotFound: true,
        });

        gifts.push({
            gift: giftPurchase,
            price,
            redeemed: isPromoCodeRedeemed(promoCode),
            redemptionUrl: getGiftRedemptionUrl(giftPurchase.id),
        });
    }

    return {
        props: {
            gifts,
            allGiftPurchases,
        },
    };
};

const Page: NextPage<Props> = ({ gifts, allGiftPurchases }) => {
    return (
        <Container maxW={['container.lg']}>
            <Box experimental_spaceY={12} pos="relative">
                <Center w="full">
                    <VStack>
                        <VStack>
                            <Heading as="p" textAlign={'center'} whiteSpace={'break-spaces'}>
                                Gift Purchase Summary 🎁
                            </Heading>
                            <Text fontSize="lg" textAlign={'center'}>
                                Thank you for giving the gift of PulseBanner Membership! ❤️
                            </Text>
                        </VStack>

                        <Card props={{ maxW: 'full' }}>
                            <VStack spacing={8} maxW={['auto', '2xl']} p="1">
                                <Box experimental_spaceY={4} w="full">
                                    <VStack>
                                        <Heading size="lg" textAlign={'left'} w="full">
                                            {gifts.length}
                                            {'x '}
                                            {gifts[0].price.nickname} {gifts[0].price.product.name}
                                        </Heading>
                                        <Text w="full">Purchase Date: {gifts[0].gift.createdAt.toLocaleDateString()}</Text>
                                    </VStack>
                                    <VStack align={'start'}>
                                        <Heading size={'md'}>Gift Redemption Link{gifts.length === 1 ? '' : 's'}</Heading>
                                        <Text size={'sm'} maxW="full">
                                            Gifts have a unique redemption link. Share this link with anyone to let them redeem the gift. View your gift redemption links below.
                                        </Text>
                                        <Alert status="warning" bg={'whiteAlpha.300'} w="full" fontSize="sm" p="2" rounded="md">
                                            <AlertIcon />
                                            <AlertTitle mr={2} display={['none', 'inherit']}>
                                                Warning
                                            </AlertTitle>
                                            <AlertDescription lineHeight={1.2}>Redemption links can be used by anyone! Keep it safe.</AlertDescription>
                                        </Alert>
                                    </VStack>
                                    <VStack w="full">
                                        {gifts.map((gift) => (
                                            <Gift key={gift.gift.id} {...gift} />
                                        ))}
                                    </VStack>
                                </Box>

                                <Box experimental_spaceY={4} w="full">
                                    <Heading size={'md'}>Check your email!</Heading>
                                    <Text>
                                        {"We've sent an email to "}
                                        <strong>{gifts[0].gift.purchaserEmail}</strong>
                                        {" containing the Gift details and redemption link for safe keeping. Make sure you don't delete the gift email."}
                                    </Text>
                                    <Alert status="info" w="full" fontSize="sm" p="2" bg={'whiteAlpha.300'} rounded="md">
                                        <AlertIcon />
                                        <AlertDescription>The email may go to your junk folder.</AlertDescription>
                                    </Alert>
                                </Box>

                                <Box experimental_spaceY={4} w="full">
                                    <Heading size="md">Redemption Instructions</Heading>
                                    <Text maxW="xl">
                                        Share the redemption link with the person you want to give the gift to. The link will take them to a checkout page. The checkout subtotal
                                        will be $0.00 since they are redeeming a gift.
                                    </Text>
                                    <Text maxW="xl">
                                        Payment details are required in order to continue the Membership after the duration of the gift has passed. Redeemer can cancel at any time.
                                    </Text>
                                    <Text maxW="xl">In the future, you can access your gift purchase summaries from your account page.</Text>
                                </Box>
                            </VStack>
                        </Card>
                        <VStack>
                            <Text fontSize="lg" textAlign={'center'}>
                                If you need help, please message us in our Discord or DM us on Twitter.
                            </Text>
                            <Center>
                                <ButtonGroup>
                                    <NextLink passHref href={discordLink}>
                                        <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                            Join our Discord
                                        </Button>
                                    </NextLink>
                                    <NextLink passHref href={twitterLink}>
                                        <Button as="a" size="sm" colorScheme="twitter" rightIcon={<FaTwitter />}>
                                            Twitter
                                        </Button>
                                    </NextLink>
                                </ButtonGroup>
                            </Center>
                        </VStack>
                    </VStack>
                </Center>
                <GiftSummary gifts={gifts} allGiftPurchases={allGiftPurchases} />
                <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                    <div className="contact-hero" style={{ position: 'relative', top: '-800px', right: '-100px', height: '38%' }}>
                        <div className="bg-gradient-blur-wrapper contact-hero">
                            <div className="bg-gradient-blur-circle-3 pink top"></div>
                            <div className="bg-gradient-blur-circle-2 blue"></div>
                            <div className="bg-gradient-blur-circle-4 purple"></div>
                        </div>
                    </div>
                </div>

                <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                    <div className="contact-hero" style={{ position: 'relative', top: '0px', right: '600px', height: '18%' }}>
                        <div className="bg-gradient-blur-wrapper contact-hero">
                            <div className="bg-gradient-blur-circle-3 pink top"></div>
                            <div className="bg-gradient-blur-circle-2 blue"></div>
                            <div className="bg-gradient-blur-circle-4 purple"></div>
                        </div>
                    </div>
                </div>
            </Box>
            <Confetti />
        </Container>
    );
};

export default Page;
