// we need to show this modal everytime they do not have authentication
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Button, Center, Text, Link, Flex, Spacer } from '@chakra-ui/react';
import { Account, Session } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { FaTwitter } from 'react-icons/fa';
import NextLink from 'next/link';

interface ConnectTwitchModalProps {
    onClose: () => void;
    isOpen: boolean;
    session: Session & { accounts?: { [key: string]: Account } };
    callbackUrl?: string;
}

export const ReconnectTwitterModal: React.FC<ConnectTwitchModalProps> = ({ session, isOpen, onClose, callbackUrl = '/3,443,652' }) => {
    return (
        <Modal onClose={onClose} size={'xl'} isOpen={true}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Oops! Reconnect Twitter</Center>
                    <Center>Connect to Twitter to use PulseBanner!</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalCloseButton />
                <ModalBody minH="32" h="32" pb="4">
                    <Flex h="full" direction="column" justifyContent="space-between">
                        <VStack>
                            <Button
                                onClick={

                                    () => {
                                        signIn('twitter', {
                                            callbackUrl: `${callbackUrl}`,
                                        });
                                    }
                                }
                                colorScheme="twitter"
                                leftIcon={<FaTwitter />}
                            >
                                Reconnect to Twitter
                            </Button>
                        </VStack>
                        <Center mt="4">
                            <Text fontSize="sm">
                                {'By signing up, you agree to our'}{' '}
                                <Link as={NextLink} href="/terms" passHref>
                                    Terms
                                </Link>{' '}
                                and{' '}
                                <Link as={NextLink} href="/privacy" passHref>
                                    Privacy Policy
                                </Link>
                            </Text>
                        </Center>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
