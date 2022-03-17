import { Price, PriceInterval, Product } from '@prisma/client';
import type { GetServerSideProps, GetStaticProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Button,
    Heading,
    Text,
    Center,
    chakra,
    Container,
    VStack,
    SimpleGrid,
    HStack,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Switch,
    Tag,
    Flex,
    Link,
    Box,
    WrapItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Image,
    useBreakpoint,
    LightMode,
    DarkMode,
    Grid,
    GridItem,
    Tooltip,
    Spacer,
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaArrowRight, FaHeart } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import { PaymentPlan } from '@app/util/database/paymentHelpers';
import { NextSeo } from 'next-seo';
import { generalFaqItems, pricingFaqItems } from '@app/modules/faq/data';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { FreeProductCard } from '@app/components/pricing/FreeProductCard';
import { Card } from '@app/components/Card';
import { landingPageAsset } from '.';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { GiftCard } from '@app/components/pricing/GiftCard';
import { ButtonSwitch } from '@app/components/buttonSwitch/ButtonSwitch';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { giftPriceIds } from '@app/util/stripe/gift/constants';
import { GiftPricing } from '@app/modules/pricing/GiftPricing';

type Props = {
    prices: (Price & { product: Product })[];
    priceMap: Record<string, Price & { unitAmount: number } & { product: Product }>;
};

const Page: NextPage<Props> = ({ priceMap }) => {
    return (
        <VStack spacing={16} pos={'relative'}>
            <Container maxW="container.lg" experimental_spaceY="6" pb="8" mt="-8">
                <Heading size="xl" textAlign="center" h="full" bgGradient="linear(to-r, #2AA9ff, #f246FF)" bgClip="text" fontSize={['5xl', '7xl']} fontWeight="bold">
                    Membership Gifts
                </Heading>
            </Container>

            <GiftPricing priceMap={priceMap} />
            <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                <div className="contact-hero" style={{ position: 'relative', top: '500px', left: '0px', height: '58%' }}>
                    <div className="bg-gradient-blur-wrapper contact-hero">
                        {/* <div className="bg-gradient-blur-circle-3 pink top"></div> */}
                        <div className="bg-gradient-blur-circle-2 blue"></div>
                        <div className="bg-gradient-blur-circle-4 purple"></div>
                    </div>
                </div>
            </div>
            <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                <div className="contact-hero" style={{ position: 'relative', top: '400px', left: '-700px', height: '48%' }}>
                    <div className="bg-gradient-blur-wrapper contact-hero">
                        <div className="bg-gradient-blur-circle-3 pink top"></div>
                        <div className="bg-gradient-blur-circle-2 blue"></div>
                        <div className="bg-gradient-blur-circle-4 purple"></div>
                    </div>
                </div>
            </div>
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                    Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
                </Text>

                <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                    Help empower creators by supporting us ♥️
                </Text>
                <Box pt="32">
                    <FaqSection items={pricingFaqItems.concat(generalFaqItems)} />
                </Box>
            </Container>
        </VStack>
    );
};

// Since we export getServerSideProps method in this file, it means this page will be rendered on the server
// aka this page is server-side rendered
// This method is run on the server, then the return value is passed in as props to the component above
export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const prices = await prisma.price.findMany({
        where: {
            active: true,
            AND: {
                product: {
                    active: true,
                },
            },
        },
        include: {
            product: true,
        },
    }) as (Price & { unitAmount: number } & { product: Product })[];

    const priceMap: Record<string, typeof prices[0]> = prices.reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {} as any);

    return {
        props: {
            prices,
            priceMap,
        },
    };
};

export default Page;
