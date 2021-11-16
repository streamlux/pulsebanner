import React from 'react';
import {
    Box,
    Button,
    chakra,
    Code,
    Text,
    useBoolean,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    ButtonGroup,
} from '@chakra-ui/react';
import useSWR from 'swr';
import { Panel } from './Panel';
import axios from 'axios';

export const Webhooks: React.FC = () => {
    const {
        data: webhooks,
        isValidating: loading,
        error,
    } = useSWR('/twitch/subscription', async () => (await fetch('/api/twitch/subscription')).json(), {
        revalidateOnFocus: false,
    });

    const removeWebhook = async () => {
        const response = await axios.delete('/api/twitch/subscription');
    };

    const [showRaw, { toggle }] = useBoolean();
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Panel name="Webhooks">
            <Box experimental_spaceY="2">
                {error && (
                    <>
                        <Text>Error loading webhooks</Text>
                        <Code>{JSON.stringify(error)}</Code>
                    </>
                )}
                <Text>
                    Total webhook subscriptions: {loading && 'Loading...'}
                    {!loading && (webhooks?.subscriptions?.length ?? 'No webhooks')}
                </Text>
                <ButtonGroup>
                    <Button onClick={async () => removeWebhook()}>Delete webhooks</Button>
                    <Button onClick={onOpen}>Show raw</Button>
                </ButtonGroup>
                {showRaw && (
                    <Code as={chakra.pre} overflowX="scroll" maxW="100%">
                        {!loading && JSON.stringify(webhooks, null, 2)}
                    </Code>
                )}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Twitch Webhooks JSON</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Code as={chakra.pre} overflowX="scroll" w="100%" p="2" rounded="md">
                                {!loading && JSON.stringify(webhooks, null, 2)}
                            </Code>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        </Panel>
    );
};
