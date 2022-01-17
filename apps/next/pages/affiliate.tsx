import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { Button, FormControl, FormLabel, Input, Text, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import router from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';

interface Props {
    affiliateStatus: AffiliateStatus;
}

// all possible responses from leaddyno. If they do not have anything, just return None option
enum AffiliateStatus {
    None = 'None',
    Affiliate = 'Active',
    Pending = 'Pending Approval',
    Archived = 'Archived', // If they have been rejected
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // we just want to check/get their affiliate status (active, deactivated, none, etc.)
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const affiliateStatus = await prisma.affiliateInformation.findUnique({
            where: {
                userId: session.userId,
            },
        });

        if (affiliateStatus) {
            const affiliateId = affiliateStatus.affiliateId;
            try {
                const affiliateInfo = await axios.get(`https://api.leaddyno.com/v1/affiliates/${affiliateId}`, {
                    params: {
                        key: process.env.LEADDYNO_API_KEY,
                    },
                });
                console.log('affiliateInfo: ', affiliateInfo.data);
                const status = affiliateInfo.data.status;
                return {
                    props: {
                        affiliateStatus: status as AffiliateStatus,
                    },
                };
            } catch (e) {
                console.log('error: ', e);
            }
        }
    }

    return {
        props: {
            affiliateStatus: AffiliateStatus.None,
        },
    };
};

export default function Page({ affiliateStatus }: Props) {
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/affiliate');
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const toast = useToast();

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const [emailValue, setEmailValue] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [paypalEmailValue, setPaypalEmailValue] = useState('');

    const handleEmailChange = (e) => setEmailValue(e.target.value);
    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleLastNameChange = (e) => setLastName(e.target.value);
    const handleDiscountCodeChange = (e) => setDiscountCode(e.target.value);
    const handlePaypalEmailChange = (e) => setPaypalEmailValue(e.target.value);

    const availableForAccount = (): boolean => {
        if (paymentPlan === 'Free' && !paymentPlanResponse?.partner) {
            return false;
        }
        return true;
    };

    const validateEmailFields = (email: string): any => {
        return (
            null !==
            String(email)
                .toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        );
    };

    const validateTextFields = (): boolean => {
        return firstName.length > 0 && discountCode.length > 0;
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const submitAffiliateRequest = async () => {
        if (!ensureSignUp()) {
            console.log('not signed up!');
            return;
        }

        if (validateEmailFields(emailValue) && validateEmailFields(paypalEmailValue) && validateTextFields()) {
            // call endpoint here. Still do validation on the discount code and items already existing
            // send back the details in the body
            const data = {
                email: emailValue,
                firstName: firstName,
                lastName: lastName,
                discountCode: discountCode,
                paypalEmail: paypalEmailValue,
            };

            const response = await axios.post('/api/affiliate', data);
            console.log('response: ', response);
        } else {
            console.log('invalid field');
        }
    };

    // this is the page if they are looking to sign up. We should disable to submit button or show them a different page if they are not pulsebanner member
    const SignUpPage = () => (
        <>
            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input id="email" type="email" placeholder="Email" value={emailValue} onChange={handleEmailChange} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>First name</FormLabel>
                <Input id="firstName" placeholder="First name" value={firstName} onChange={handleFirstNameChange} />
            </FormControl>
            <FormControl>
                <FormLabel>Last name</FormLabel>
                <Input id="lastName" placeholder="Last name" value={lastName} onChange={handleLastNameChange} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Discount Code</FormLabel>
                <Input id="discountCode" placeholder="Desired discount code (subject to approval and change)" value={discountCode} onChange={handleDiscountCodeChange} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Paypal email</FormLabel>
                <Input id="paypalEmail" type="email" placeholder="Paypal email" value={paypalEmailValue} onChange={handlePaypalEmailChange} />
            </FormControl>

            <Button onClick={submitAffiliateRequest}>Submit</Button>
        </>
    );

    // this is the page if they either have been rejected from joining the program or have de-activated a premium plan.
    const ArchivedPage = () => (
        <>
            <Text>Sorry, your account has either been rejected for the partnership program or suspended due to no longer being a PulseBanner member</Text>
        </>
    );

    const PendingPage = () => (
        <>
            <Text>We are processing your request. Please check back in the near future to see your status.</Text>
        </>
    );

    const UIDisplayMapping: Record<AffiliateStatus, JSX.Element> = {
        [AffiliateStatus.None]: SignUpPage(),
        [AffiliateStatus.Affiliate]: SignUpPage(),
        [AffiliateStatus.Archived]: ArchivedPage(),
        [AffiliateStatus.Pending]: PendingPage(),
    };

    return (
        <>
            <NextSeo
                title="Twitter "
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/affiliate',
                    title: 'PulseBanner - Affiliate Program',
                    description: 'Easily earn back money with the more users you refer to becoming PulseBanner members',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/pulsebanner_name_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner offers our members the ability to earn money when they refer another user.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/affiliate" />
            {UIDisplayMapping[affiliateStatus]}
        </>
    );
}
