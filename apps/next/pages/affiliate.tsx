import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { Button, FormControl, FormLabel, HStack, Input, Text, useBoolean, useDisclosure, useToast } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import { useState } from 'react';
import useSWR from 'swr';

interface Props {
    email: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;
    return {
        props: {},
    };
};

export default function Page({ email }: Props) {
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
    const handleFirstNameChange = (e) => setEmailValue(e.target.value);
    const handleLastNameChange = (e) => setEmailValue(e.target.value);
    const handleDiscountCodeChange = (e) => setEmailValue(e.target.value);
    const handlePaypalEmailChange = (e) => setEmailValue(e.target.value);

    const availableForAccount = (): boolean => {
        if (paymentPlan === 'Free' && !paymentPlanResponse?.partner) {
            return false;
        }
        return true;
    };

    const submitAffiliateRequest = async () => {
        console.log('affiliate req');
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
            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input id="email" type="email" placeholder="Email" value={emailValue} onChange={handleEmailChange} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>First name</FormLabel>
                <Input id="firstName" placeholder="First name" value={firstName} onChange={handleFirstNameChange} />
            </FormControl>
            <FormControl isRequired>
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
}
