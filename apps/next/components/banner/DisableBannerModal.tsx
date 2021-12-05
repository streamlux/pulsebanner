import { Center, HStack, Stack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { Button, ModalFooter, Textarea, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const DisableBannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [buttonValue, setButtonValue] = useState('I no longer stream');
    const [inputValue, setInputValue] = useState('');

    const toast = useToast();

    const toastHelper = () =>
        toast({
            title: 'Banner Deactivated',
            description: 'Your banner will not change when you stream next time. Re-enable to get banner updates!',
            status: 'success',
            duration: 7000,
            isClosable: true,
            position: 'top',
        });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Reason for disabling your banner</Center>
                </ModalHeader>
                <ModalCloseButton onClick={() => toastHelper()} />
                <ModalBody>
                    <RadioGroup defaultValue="I am no longer streaming" onChange={(radioValue) => setButtonValue(radioValue)}>
                        <Stack>
                            <Radio value="I am no longer streaming">I am no longer streaming</Radio>
                            <Radio value="PulseBanner is missing what I want">PulseBanner is missing what I want</Radio>
                            <Radio value="I do not want to use PulseBanner anymore">I do not want to use PulseBanner anymore</Radio>
                            <Textarea placeholder="Comment" onChange={(val) => setInputValue(val.target.value)} />
                        </Stack>
                    </RadioGroup>
                </ModalBody>
                <ModalFooter>
                    <HStack>
                        <Button
                            colorScheme="teal"
                            variant="solid"
                            onClick={async () => {
                                await axios.post('/api/discord/disabledbanner', {
                                    radioValue: buttonValue,
                                    inputValue: inputValue,
                                });
                                toast({
                                    title: 'Banner Deactivated',
                                    description: 'Thank you for your feedback. Re-enable to get banner updates!',
                                    status: 'success',
                                    duration: 7000,
                                    isClosable: true,
                                    position: 'top',
                                });
                                setInputValue('');
                                onClose();
                            }}
                        >
                            Submit
                        </Button>
                        <Button
                            colorScheme="red"
                            variant="solid"
                            onClick={() => {
                                toastHelper();
                                onClose();
                            }}
                        >
                            Skip
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
