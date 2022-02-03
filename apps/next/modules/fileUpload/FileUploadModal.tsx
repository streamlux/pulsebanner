import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Image,
    Center,
    HStack,
    VStack,
    ModalFooter,
    Button,
    Box,
    toast,
    useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { ReactElement, FC, useState, useEffect } from 'react';
import { UploadForm } from './uploadForm';

type FileUploadModalProps = {
    title: string;
    isOpen: boolean;
    onClose: () => void;
};

export const FileUploadModal: FC<FileUploadModalProps> = ({ title, isOpen, onClose }): ReactElement => {
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState(undefined as string);
    const toast = useToast();
    const router = useRouter();
    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        const img = document.createElement('img');
        img.src = objectUrl;
        img.onload = () => {
            if (img.width !== 1500 && img.height !== 500) {
                toast({
                    status: 'error',
                    title: 'Image must be 1500x500',
                    position: 'top',
                });
                setPreview(undefined);
            }
        };

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const onSelectFile = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        // I've kept this example simple by using the first image instead of multiple
        setSelectedFile(e.target.files[0]);
    };

    const onSubmit = (data) => {
        const formData = new FormData();

        formData.append('File', data.file_[0]);

        fetch('/api/features/banner/offline', {
            method: 'POST',
            body: formData,
        })
            .then((result) => {
                onClose();
                toast({
                    status: 'success',
                    title: 'Offline banner saved',
                    position: 'top',
                });
                router.reload();
                console.log('Success:', result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay />
            <ModalContent alignContent="center" rounded="md">
                <ModalHeader pb="0">
                    <Text>{title}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody py="4">
                    <VStack w="full">
                        <Center w="full">
                            <Image src={preview} alt="Preview" maxW={['90vw', '900px']} maxH="300px" fallbackSrc="https://placehold.co/900x300?text=1500x500" />
                        </Center>
                        <Center>
                            <Box w="full">
                                <UploadForm
                                    onSubmit={onSubmit}
                                    onChange={(e) => {
                                        onSelectFile(e);
                                    }}
                                />
                            </Box>
                        </Center>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
