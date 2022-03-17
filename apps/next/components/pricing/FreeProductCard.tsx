import { CloseIcon } from '@chakra-ui/icons';
import { Heading, List, ListItem, ListIcon, Button, HStack, Box, Flex, Center, Stack, useBreakpoint } from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/react';
import { FaArrowRight } from 'react-icons/fa';
import { Card } from '../Card';
import {
    ProductCardHeading,
    ProductCardTitle,
    ProductCardDescription,
    ProductCardPricing,
    ProductCardPrice,
    ProductCardPriceAmount,
    ProductCardBody,
    ProductCardFeaturesListHeading,
    ProductCardFeatureList,
    ProductCardFeatureListItem,
    ProductCardFooter,
} from './ProductCardParts';

type Props = {
    modal?: boolean;
};

export const FreeProductCard: React.FC<Props> = ({ modal }) => {
    const mobile = useBreakpoint() === 'base';
    const { status, data: session } = useSession({ required: false }) as any;
    return (
        <Card props={{ w: 'full', h: 'full' }}>
            <Flex direction={modal ? 'column' : 'row'} justifyContent={'space-between'} w="full" h="full">
                <ProductCardHeading>
                    <ProductCardTitle>Free</ProductCardTitle>
                    <ProductCardDescription>Use limited PulseBanner features for free!</ProductCardDescription>
                </ProductCardHeading>
                {modal && !mobile && (
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
                )}

                <Stack flexGrow={1} direction={modal ? 'column' : 'row'} spacing={2} justifyContent={'space-around'}>
                    <Box>
                        <ProductCardFeaturesListHeading>{"What's included?"}</ProductCardFeaturesListHeading>
                        <ProductCardFeatureList>
                            {['Twitter Live Banner', 'Twitter Name Changer'].map((feature) => (
                                <ProductCardFeatureListItem key={feature}>{feature}</ProductCardFeatureListItem>
                            ))}
                        </ProductCardFeatureList>
                    </Box>
                    <Box>
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
                                Custom background image
                            </ListItem>
                        </List>
                    </Box>
                </Stack>

                <Center>
                    {!session && (
                        <Button
                            mt='4'
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
                </Center>
            </Flex>
        </Card>
    );
};
