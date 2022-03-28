import { Link, List, ListIcon, ListItem, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import NextLink from 'next/link';

export interface FaqItem {
    id: string;
    question: ReactNode;
    answer: ReactNode;
    learnMoreLink?: string;
}

export const generalFaqItems: FaqItem[] = [
    {
        id: 'isItFree',
        question: <>Is PulseBanner free?</>,
        answer: <>Yes! PulseBanner is free to use forever. However, you can unlock more features and customization by upgrading to a PulseBanner Membership.</>,
        learnMoreLink: '/pricing',
    },
    {
        id: 'howDoesItWork',
        question: <>How does PulseBanner work?</>,
        answer: (
            <>PulseBanner uses the official Twitch APIs to get notified when you start and stop streaming. Then the official Twitter API is used to update your Twitter profile.</>
        ),
    },
    {
        id: 'twitterPermissions',
        question: <>Why does PulseBanner need so many Twitter permissions?</>,
        answer: (
            <>
                Twitter does not have a granular permission system. This means that granting some permissions requires granting all permissions. Twitter understands this is a
                flawed system and are working to change it.
            </>
        ),
    },
    {
        id: 'youtube',
        question: <>Do you plan support YouTube or Theta.tv?</>,
        answer: <>Due to limitations of both the YouTube and Theta.tv APIs, we do not currently have plans to add support for these platforms.</>,
    },
];

export const pricingFaqItems: FaqItem[] = [
    {
        id: 'canICancel',
        question: <>Can I cancel my subscription anytime?</>,
        answer: <>Yes! You can cancel/pause/upgrade/downgrade your subscription anytime with a click of a button. No question asked.</>,
    },
];

export const giftFaqItems: FaqItem[] = [
    {
        id: 'howRedeemGift',
        question: <>How are Gifts redeemed?</>,
        answer: <>Gifts are redeemed with the unique redemption link. Once you purchase a Gift, you will recieve the redemption link, along with instructions for how to share and redeem gifts.</>,
    },
    {
        id: 'canIRedeemIfImAMember',
        question: <>Can I redeem a gift if I already have a subscription?</>,
        answer: <>If you already have a subscription, you cannot redeem a gift.</>,
    },
    {
        id: 'giftRefundable',
        question: <>Are Membership Gifts refundable?</>,
        answer: <>Once a Membership Gift has been redeemed, it cannot be refunded.</>,
    },
];

export const bannerFaqItems: FaqItem[] = [
    {
        id: 'whatDoesBannerDo',
        question: <>What does the PulseBanner Live Banner do?</>,
        answer: (
            <>
                Once enabled, your Twitter banner will update when you start broadcasting on Twitch. Your banner will revert back to your current banner image when your stream
                ends.
            </>
        ),
    },
    {
        id: 'doesNotChange',
        question: "Why didn't my banner change even though I am live?",
        answer: <>If you enabled your banner during a stream, your banner will automatically change the next time you stream.</>,
    },
    {
        id: 'bannerRefreshing',
        question: <>What is banner refreshing?</>,
        answer: (
            <>
                Refresh speed means how often PulseBanner will re-render your Live Banner and update it on Twitter. This way, the stream preview on your banner will update as you
                stream.
            </>
        ),
        learnMoreLink: '/pricing',
    },
    {
        id: 'thumbnailNotChanging',
        question: <>Why is the thumbnail on my banner not updating?</>,
        answer: <>Since rendering banners is expensive, banner refreshing is only available for PulseBanner Members.</>,
        learnMoreLink: '/pricing',
    },
];

export const profileImageFaqItems: FaqItem[] = [
    {
        id: 'pfpIsItFree',
        question: <>Is Live Profile Picture feature free?</>,
        answer: <>No, the Live Profile Picture is available to PulseBanner Members only.</>,
        learnMoreLink: '/pricing',
    },
];

export const nameChangerFaqItems: FaqItem[] = [
    {
        id: 'nameChangerIsItFree',
        question: <>Is the Name Changer feature free?</>,
        answer: <>Yes, the Name Changer is free to use! Upgrade to a PulseBanner Membership to fully customize your live name.</>,
        learnMoreLink: '/pricing',
    },
];

export const allFaqItems = [...generalFaqItems, ...bannerFaqItems, ...profileImageFaqItems, ...nameChangerFaqItems, ...pricingFaqItems];
