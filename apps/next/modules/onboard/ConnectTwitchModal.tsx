import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    Button,
    Center,
    Text,
    Link,
    Flex,
    Spacer,
    LightMode,
    ModalFooter,
} from '@chakra-ui/react';
import { Account, Session } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { FaTwitter, FaCheck, FaTwitch } from 'react-icons/fa';
import NextLink from 'next/link';
import { CustomSession } from '@app/services/auth/CustomSession';

interface ConnectTwitchModalProps {
    onClose: () => void;
    isOpen: boolean;
    session: CustomSession | null;
    callbackUrl?: string;
}

export const ConnectTwitchModal: React.FC<ConnectTwitchModalProps> = ({ session, isOpen, onClose, callbackUrl = '/banner' }) => {
    const hasTwitter = session?.accounts?.twitter;
    return (
        <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Almost there!</Center>
                    <Center>{hasTwitter ? 'Connect your Twitch account to continue.' : 'Connect your Twitter account to continue.'}</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalCloseButton />
                <ModalBody minH="16">
                    <Flex h="full" direction="column" justifyContent="space-between">
                        <VStack>
                            <Spacer />
                            <LightMode>
                                <Button
                                    onClick={
                                        hasTwitter
                                            ? undefined
                                            : () =>
                                                  signIn('twitter', {
                                                      callbackUrl: `${callbackUrl}?modal=true`,
                                                  })
                                    }
                                    colorScheme="twitter"
                                    leftIcon={<FaTwitter />}
                                    rightIcon={hasTwitter ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitter
                                </Button>
                            </LightMode>

                            {session && (
                                <Button
                                    onClick={() =>
                                        signIn('twitch', {
                                            callbackUrl,
                                        })
                                    }
                                    color="white"
                                    colorScheme="twitch"
                                    leftIcon={<FaTwitch />}
                                    rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitch
                                </Button>
                            )}
                        </VStack>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Center w="full">
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
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
