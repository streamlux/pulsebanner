import { Box, Center, HStack, Link, Stack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Button, Checkbox, CheckboxGroup, ModalFooter, Textarea, useToast, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { StringOrNumber } from '@chakra-ui/utils';
import { ChatIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { discordLink } from '@app/util/constants';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const DisableBannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [buttonValue, setButtonValue] = useState('I no longer stream');
    const [inputValue, setInputValue] = useState('');

    const [feedbackItems, setFeedbackItems] = useState([] as StringOrNumber[]);

    const toast = useToast();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>
                        <HStack>
                            <ChatIcon />
                            <Text>Disabled Banner Feedback</Text>
                        </HStack>
                    </Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody py="0">
                    <Text pb="2">Your Live Banner has been disabled. Please take a second to help us improve PulseBanner.</Text>
                    <Box experimental_spaceY={4}>
                        <Box>
                            <CheckboxGroup colorScheme="purple" defaultValue={[]} onChange={setFeedbackItems}>
                                <Stack spacing={[2]} direction={['column']}>
                                    <Checkbox value="Live Banner was not working.">My Live Banner isn{"'"}t working.</Checkbox>
                                    <Checkbox value="I am no longer streaming">I no longer stream on Twitch</Checkbox>
                                    <Checkbox value="PulseBanner is missing what I want">PulseBanner is missing what I want</Checkbox>
                                    <Checkbox value="I do not want to use PulseBanner anymore">I do not want to use PulseBanner anymore</Checkbox>
                                </Stack>
                            </CheckboxGroup>
                        </Box>

                        <Textarea placeholder="Additional comments" onChange={(val) => setInputValue(val.target.value)} />
                        <Center>
                            <HStack>
                                {feedbackItems.includes('Live Banner was not working.') && <Text>We can fix it! 👉</Text>}
                                {!feedbackItems.includes('Live Banner was not working.') && feedbackItems.includes('PulseBanner is missing what I want') && (
                                    <Text>We can add it! 👉</Text>
                                )}
                                <NextLink href={discordLink} passHref>
                                    <Button as="a" target='_blank' variant={'solid'} size="sm">
                                        Join our Discord
                                    </Button>
                                </NextLink>
                            </HStack>
                        </Center>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <HStack>
                        <Button
                            colorScheme="green"
                            variant="solid"
                            onClick={async () => {
                                if (feedbackItems.length < 1 && inputValue === '') {
                                    toast({
                                        status: 'error',
                                        title: 'Please check at least one option before submitting.',
                                        position: 'top',
                                    });
                                    return;
                                }
                                await axios.post('/api/discord/disabledbanner', {
                                    radioValue: feedbackItems.length > 0 ? '\n' + feedbackItems.join('\n') : 'None',
                                    inputValue: inputValue === '' ? 'None' : '\n' + inputValue,
                                });
                                toast({
                                    title: 'Thank you for your feedback.',
                                    status: 'success',
                                    duration: 5000,
                                    isClosable: false,
                                    position: 'top',
                                });
                                setFeedbackItems([]);
                                setInputValue('');
                                onClose();
                            }}
                        >
                            Submit
                        </Button>
                        <Button variant="solid" onClick={onClose}>
                            Skip
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
