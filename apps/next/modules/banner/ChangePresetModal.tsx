import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Button, Center, Text, Link, Flex, Spacer } from '@chakra-ui/react';
import { Account, Session } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { FaTwitter, FaCheck, FaTwitch } from 'react-icons/fa';
import NextLink from 'next/link';
import { BannerPresetList } from './BannerPresetList';
import { ReactNode } from 'react';

interface ChangePresetModalProps {
    onClose: () => void;
    isOpen: boolean;
    children: ReactNode;
}

export const ChangePresetModal: React.FC<ChangePresetModalProps> = ({ isOpen, onClose, children }) => {
    return (
        <Modal onClose={onClose} size={'5xl'} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Select Banner Template</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalCloseButton />
                <ModalBody>{children}</ModalBody>
            </ModalContent>
        </Modal>
    );
};
