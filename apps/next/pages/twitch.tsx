/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ButtonGroup } from '@chakra-ui/button';
import { Heading } from '@chakra-ui/layout';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

export default function Page() {
    // when they enable the feature, we will create a webhook for each stream online and offline
    // this will only be available after signing in
    const [enabled, setEnabled] = useState(false);

    const enableFeature = async () => {
        // get the userId first
        const session = await getSession();
        let userId;
        if (session?.userId !== undefined) {
            userId = session?.userId;
        }

        // create streamOnline webhook
        const streamOnlineResponse = await axios.post(`/api/twitch/subscription/stream.online?userId=${userId}`);
        console.log('streamOnline: ', streamOnlineResponse.status);

        // create streamOffline webhook
        const streamOfflineResponse = await axios.post(`api/twitch/subscription/stream.offline?userId=${userId}`);
        console.log('streamOffline: ', streamOfflineResponse.status);

        setEnabled(true);
    };

    const removeWebhook = async () => {
        const response = await axios.delete('/api/twitch/subscription');
        console.log('response: ', response.data);
        setEnabled(false);
    };

    const getExistingWebhooks = async () => {
        const response = await axios.get('/api/twitch/subscription');
        console.log('response: ', response.data);
    };

    return (
        <>
            <Heading>Twitch Listening</Heading>
            <ButtonGroup>
                <Button
                    onClick={async () => {
                        if (enabled) {
                            await removeWebhook();
                        } else {
                            await enableFeature();
                        }
                    }}
                >
                    {enabled ? `Disable PulseBanner` : `Enable PulseBanner`}
                </Button>
                <Button onClick={async () => getExistingWebhooks()}>Existing webhooks</Button>
                <Button onClick={async () => removeWebhook()}>Remove webhooks</Button>
            </ButtonGroup>
        </>
    );
}
