import { NextSeo } from 'next-seo';
import {
  Container, Flex, Box, Heading, Text, Button, VStack, useClipboard,
  Icon, Tooltip, SimpleGrid, Center, useToast, ButtonGroup
} from '@chakra-ui/react';
import {
  MdEmail,
  MdLocationOn,
} from 'react-icons/md';
import NextLink from 'next/link';
import { BiSupport } from 'react-icons/bi';
import { MdGroups } from 'react-icons/md';
import * as React from "react";
import { ReactElement } from 'react';
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { FiTwitter } from "react-icons/fi"
import { FaDiscord, FaCopy } from "react-icons/fa"
import { discordLink, twitterLink } from '@app/util/constants';

interface FeatureProps {
  title: string;
  text: string;
  icon: ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Container>
      <VStack>
        <Center
          maxW="container.lg"
          w={12}
          h={12}
          align={'center'}
          justify={'center'}
          color={'white'}
          rounded={'full'}
          mb={1}>
          {icon}
        </Center>
        <Text textAlign={'center'} fontSize='3xl' fontWeight={600}>{title}</Text>
        <Text textAlign={'center'} colorScheme={'green'}>{text}</Text>

      </VStack>
    </Container>
  );
};

export default function Page() {
  const [value, setValue] = React.useState('contact@pulsebanner.com')
  const { hasCopied, onCopy } = useClipboard(value)
  const toast = useToast()
  return (
    <>
      <NextSeo
        title="Contact"
        openGraph={{
          site_name: 'PulseBanner',
          type: 'website',
          url: 'https://pulsebanner.com/contact',
          title: 'PulseBanner - Contact',
          images: [
            {
              url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
              width: 1200,
              height: 627,
              alt: 'PulseBanner',
            },
          ],
        }}
        twitter={{
          site: '@PulseBanner',
          cardType: 'summary_large_image',
        }}
      />
      <Box p={4}>
        <Center>
          <VStack>
            <Heading w="full" and textAlign="center">
            We'd Love to Hear From You
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={10}>

              <Feature
                icon={<Icon as={BiSupport} w={10} h={10} />}
                title={'Get support'}
                text={ "We're here to help. you can e-mail us with any questions you may have or message us in Discord or on Twitter!"}

              />
              <Center>
                <ButtonGroup spacing={1}>
                  <Button as="a" target="_blank" maxW={300}>
                    contact@pulsebanner.com
                  </Button>
                  <Button onClick={() =>
                    toast({
                      title: 'Copied!',
                      status: 'success',
                      duration: 2000,
                      isClosable: false,
                    })
                  }>
                    {<FaCopy />}
                  </Button>
                </ButtonGroup>
              </Center>

              <Feature
                icon={<Icon as={MdGroups} w={10} h={10} />}
                title={'Follow the Socials'}
                text={
                  'We have a very active Discord server and Twitter account!'
                }
              />
              <SimpleGrid minChildWidth={200} spacing='10px'>
                <NextLink passHref href="https://twitter.com/PulseBanner?ref_src=twsrc%5Etfw">
                  <Button as="a" target="_blank" colorScheme="twitter" leftIcon={<FiTwitter />} maxW={500}>
                    Follow us on Twitter
                  </Button>
                </NextLink>
                <NextLink passHref href={discordLink}>
                  <Button as="a" target="_blank" leftIcon={<FaDiscord />} maxW={500}>
                    Join our Discord
                  </Button>
                </NextLink>
              </SimpleGrid>
              <Feature
                icon={<Icon as={AiOutlineQuestionCircle} w={10} h={10} />}
                title={'Suggestions?'}
                text={
                  'We have a place for this! Join our Discord, and write it in the suggestions channel!'
                }
              />
            </SimpleGrid>
          </VStack>
        </Center>
      </Box>
    </>
  );
}
