import { CloseIcon } from "@chakra-ui/icons";
import { Heading, List, ListItem, ListIcon, Button } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { FaArrowRight } from "react-icons/fa";
import { Card } from "../Card";
import { ProductCardHeading, ProductCardTitle, ProductCardDescription, ProductCardPricing, ProductCardPrice, ProductCardPriceAmount, ProductCardBody, ProductCardFeaturesListHeading, ProductCardFeatureList, ProductCardFeatureListItem, ProductCardFooter } from "./ProductCardParts";

export const FreeProductCard: React.FC = () => {
    const { status, data: session } = useSession({ required: false }) as any;
    return (
        <Card props={{ w: 'full', h: 'full' }}>
            <ProductCardHeading>
                <ProductCardTitle>Free</ProductCardTitle>
                <ProductCardDescription>Use some PulseBanner features for free!</ProductCardDescription>
            </ProductCardHeading>
            <ProductCardPricing
                handlePriceClick={() => {
                    const url = new window.URL(window.location.href);
                    url.searchParams.append('modal', 'true');
                    signIn('twitter', {
                        callbackUrl: url.pathname + url.search,
                    });
                }}
            >
                <ProductCardPrice>
                    <ProductCardPriceAmount>Free</ProductCardPriceAmount>
                </ProductCardPrice>
            </ProductCardPricing>

            <ProductCardBody>
                <ProductCardFeaturesListHeading>{"What's included?"}</ProductCardFeaturesListHeading>
                <ProductCardFeatureList>
                    {['Twitter Live Banner', 'Twitter Name Changer'].map((feature) => (
                        <ProductCardFeatureListItem key={feature}>{feature}</ProductCardFeatureListItem>
                    ))}
                </ProductCardFeatureList>
                <Heading size="md">{'What am I missing?'}</Heading>
                <List>
                    <ListItem key="profile image">
                        <ListIcon color="red.400" as={CloseIcon} />
                        Live Twitter Profile Picture
                    </ListItem>
                    <ListItem key="profile image">
                        <ListIcon color="red.400" as={CloseIcon} />
                        Banner refreshing
                    </ListItem>
                    <ListItem key="profile image">
                        <ListIcon color="red.400" as={CloseIcon} />
                        Custom banner background image
                    </ListItem>
                </List>
            </ProductCardBody>

            <ProductCardFooter>
                {!session && (
                    <Button
                        fontWeight="bold"
                        colorScheme="green"
                        rightIcon={<FaArrowRight />}
                        onClick={() => {
                            const url = new window.URL(window.location.href);
                            url.searchParams.append('modal', 'true');
                            signIn('twitter', {
                                callbackUrl: url.pathname + url.search,
                            });
                        }}
                    >
                        Sign up
                    </Button>
                )}
            </ProductCardFooter>
        </Card>
    );
};
