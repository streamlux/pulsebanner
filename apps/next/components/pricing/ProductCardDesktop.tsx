import { APIPaymentObject, PaymentPlan } from '@app/services/payment/paymentHelpers';
import { WrapItem, Button, Tag} from '@chakra-ui/react';
import type { Price, PriceInterval, Product } from '@prisma/client';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Card } from '../Card';
import {
    ProductCardFooter,
    ProductCardDescription,
    ProductCardHeading,
    ProductCardTitle,
    ProductCardBody,
    ProductCardFeaturesListHeading,
    ProductCardFeatureList,
    ProductCardFeatureListItem,
    ProductCardPricing,
    ProductCardPriceDescription,
    ProductCardPrice,
    ProductCardPriceAmount,
    ProductCardPriceDiscount,
} from './ProductCardParts';

interface ProductProps {
    product: Product & { prices: (Price & { unitAmount: number })[] };
    billingInterval: PriceInterval;
    handlePricingClick: (priceId: string) => void;
    paymentPlan: PaymentPlan;
    paymentPlanResponse?: APIPaymentObject;
}

export const ProductCardDesktop: React.FC<ProductProps> = ({ product, billingInterval, handlePricingClick, paymentPlan, paymentPlanResponse }) => {
    const price = product?.prices?.find((one: Price) => one.interval === billingInterval);
    const monthlyPrice = product?.prices.find((one: Price) => one.interval === 'month');

    if (!price || !monthlyPrice) {
        return null;
    }

    const isCurrentPlan = paymentPlanResponse?.priceId === price.id;

    const sharedFeatureList = ['Live Twitter profile picture', 'Custom banner colors', 'Custom background image', 'Custom fonts!', 'Fully customize Name Changer'];
    const personalFeatureList = sharedFeatureList.concat(['High quality image rendering', 'Banner refreshing (60 min)']);
    const professionalFeatureList = sharedFeatureList.concat(['Remove watermark', 'Ultra high image quality', 'Fastest banner refreshing (10 min)', 'Unlock all features']);

    const featureDescriptionMapping: Record<string, string[]> = {
        Personal: personalFeatureList,
        Professional: professionalFeatureList,
    };

    const getButtonContent = () => {
        if (isCurrentPlan) {
            return 'Current Subscription';
        }
        if (paymentPlan && paymentPlan !== 'Free') {
            return 'Change Subscription';
        }
        return `Choose ${product.name}`;
    };

    const yearly = billingInterval === 'year';

    return (
        <WrapItem key={product.name} w="full" h="full">
            <Card props={{ w: 'full', h: 'full' }}>
                <ProductCardHeading>
                    <ProductCardTitle>{product.name}</ProductCardTitle>
                    <ProductCardDescription>{product.description ?? 'Missing description'}</ProductCardDescription>
                </ProductCardHeading>
                <ProductCardPricing handlePriceClick={() => handlePricingClick(price.id)}>
                    <ProductCardPrice>
                        <ProductCardPriceAmount>{`$${(price.unitAmount / 100 / (yearly ? 12 : 1)).toFixed(2)}`}</ProductCardPriceAmount>
                        {yearly && <ProductCardPriceDiscount>{`$${monthlyPrice.unitAmount / 100}`}</ProductCardPriceDiscount>}
                    </ProductCardPrice>
                    <ProductCardPriceDescription>per month{yearly ? ', billed annually' : ''}</ProductCardPriceDescription>
                </ProductCardPricing>

                <ProductCardBody>
                    <ProductCardFeaturesListHeading>{"What's included?"}</ProductCardFeaturesListHeading>
                    <ProductCardFeatureList>
                        {featureDescriptionMapping[product.name].map((feature) => (
                            <ProductCardFeatureListItem key={feature}>{feature}</ProductCardFeatureListItem>
                        ))}
                    </ProductCardFeatureList>
                </ProductCardBody>

                <ProductCardFooter>
                    {isCurrentPlan ? (
                        <Tag colorScheme={'green'} px="4" py="2" fontSize="lg" fontWeight={'bold'}>
                            Current Subscription
                        </Tag>
                    ) : (
                        <Button
                            fontWeight="bold"
                            disabled={isCurrentPlan}
                            onClick={() => handlePricingClick(price.id)}
                            colorScheme="green"
                            rightIcon={!isCurrentPlan ? <FaArrowRight /> : undefined}
                        >
                            {getButtonContent()}
                        </Button>
                    )}
                </ProductCardFooter>
            </Card>
        </WrapItem>
    );
};
