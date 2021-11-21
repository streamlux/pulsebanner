import {
    Button,
    Center,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const NewsletterModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const toast = useToast();
    const [email, setEmail] = useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Subscribe to Newsletter</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center>Get notified about upcoming updates, new features, and more!</Center>
                    <FormControl id="email" isRequired>
                        <FormLabel>Email address</FormLabel>
                        <Input placeholder="email" type="email" onChange={(value) => setEmail(value.target.value)} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack>
                        <Button
                            colorScheme="teal"
                            variant="solid"
                            onClick={async () => {
                                const response = await axios.post('/api/newsletter/subscribe', { email: email });
                                if (response.data === 'Failure') {
                                    toast({
                                        title: 'Unable to authenticate. Make sure your email is correct',
                                    });
                                } else {
                                    onClose();
                                }
                            }}
                        >
                            Sign up
                        </Button>
                        <Button colorScheme="red" variant="solid" onClick={() => onClose()}>
                            Cancel
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
