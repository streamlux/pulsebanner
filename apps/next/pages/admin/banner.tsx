import React, { useState } from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import { Box, Center, Heading, Input, FormControl, FormLabel, Button, Image, Text, Link, SimpleGrid, HStack } from '@chakra-ui/react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getAccountsById } from '@app/util/getAccountsById';
import { getTwitterInfo, getTwitterName } from '@app/util/database/postgresHelpers';
import { download } from '@app/util/s3/download';
import { env } from 'process';
import { getBanner, getUserInfo } from '@app/util/twitter/twitterHelpers';
import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { twitchAxios } from '@app/util/axios';
import { TwitterClient } from 'twitter-api-client';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    const userId = context.query.userId;

    console.log(userId);

    if (typeof userId !== 'string' || userId === '') {
        return {
            props: {},
        };
    }

    const accounts = await getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;
    const imageBase64: string = await download(env.IMAGE_BUCKET_NAME, 'ckx8jlhsz15010hpig82hka59');
    const backupBase64: string = await download(env.BANNER_BACKUP_BUCKET, 'ckx8jlhsz15010hpig82hka59');
    const twitterInfo = await getTwitterInfo(userId, true);

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

    // get twitch stream info for user
    // https://dev.twitch.tv/docs/api/reference#get-streams
    const streamResponse = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);
    const bannerUrl: string = await getBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
    const twitchUserInfo = userResponse.data.data[0];

    const twitterUserInfo = await getUserInfo(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    return {
        props: {
            userId,
            twitterInfo,
            imageBase64,
            backupBase64,
            bannerUrl,
            stream: {
                online: !!streamResponse.data?.data?.[0],
                stream: streamResponse.data?.data?.[0],
            },
            twitchUserInfo,
            twitterUserInfo,
        },
    };
};

export default function Page({ userId, twitterInfo, imageBase64, backupBase64, bannerUrl, stream, twitchUserInfo, twitterUserInfo }) {
    useAdmin({ required: true });

    const router = useRouter();

    const [userIdInput, setUserIdInput] = useState(userId);

    const submit = () => {
        router.push(`?userId=${userIdInput}`);
    };

    const form = (
        <Box>
            <FormControl>
                <FormLabel htmlFor="userId">userId</FormLabel>
                <Input defaultValue={userId} onChange={(e) => setUserIdInput(e.target.value)} id="userId" type="userId" />
            </FormControl>
            <Button onClick={submit}>Submit</Button>
        </Box>
    );

    if (!userId) {
        return form;
    }

    return (
        <Box w="full">
            <Center>
                <Heading>Banner dashboard</Heading>
            </Center>
            <Center p="8">
                <Box>
                    <Box>
                        <FormControl>
                            <FormLabel htmlFor="userId">userId</FormLabel>
                            <HStack w="min-content">
                                <Input w="sm" defaultValue={userId} onChange={setUserIdInput} id="userId" type="userId" />
                                <Button onClick={submit}>Submit</Button>
                            </HStack>
                        </FormControl>
                    </Box>

                    <Box>
                        <Text>Stream status: {stream.online ? 'ONLINE' : 'OFFLINE'}</Text>
                        <Link isExternal href={`https://twitch.tv/${twitchUserInfo.login}`}>
                            View Twitch
                        </Link>
                        <Link isExternal href={`https://twitter.com/${twitterUserInfo.screen_name}`}>
                            View Twitter
                        </Link>
                        <Text>Twitter followers: {twitterUserInfo.followers_count}</Text>
                    </Box>
                    <Box>
                        <SimpleGrid columns={[1, 2]} spacing={4}>
                            <Box>
                                <Text>Current Twitter profile image</Text>
                                <Image src={twitterUserInfo.profile_image_url_https} alt="Twitter profile image" />
                            </Box>
                            <Box>
                                <Text>Current Twitter banner</Text>
                                <Image maxW="500px" alt="Current banner" src={bannerUrl} />
                            </Box>
                            <Box>
                                <Text>Original banner</Text>
                                <Image maxW="500px" alt="Original banner image" src={`data:image/jpeg;base64,${imageBase64}`} />
                            </Box>
                            <Box>
                                <Text>Backup banner</Text>
                                <Image maxW="500px" alt="Backup banner" src={`data:image/jpeg;base64,${backupBase64}`} />
                            </Box>
                        </SimpleGrid>
                    </Box>
                </Box>
            </Center>
        </Box>
    );
}
