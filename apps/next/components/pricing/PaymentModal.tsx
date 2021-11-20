import { Price, Product } from '.prisma/client';
import { useDisclosure } from '@chakra-ui/hooks';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { useState } from 'react';
import useSWR from 'swr';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    type PricingProps = {
        products: (Product & { prices: Price[] })[];
    };
    // useSWR call to local endpoint
    const { data } = useSWR<PricingProps>('pricing', async () => (await fetch('/api/pricing/plans')).json());

    console.log('data: ', data);

    return (
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Modal Title</ModalHeader>
                <ModalBody>Body</ModalBody>
                <ModalFooter>footer</ModalFooter>
            </ModalContent>
        </Modal>
    );
};
