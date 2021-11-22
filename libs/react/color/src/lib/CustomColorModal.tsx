import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, ButtonGroup, Button, useDisclosure, Center } from '@chakra-ui/react';
import React, { ReactElement, FC, useState } from 'react';
import { StarIcon } from '@chakra-ui/icons';
import { HexColorPicker } from 'react-colorful';

type CustomColorModalProps = {
    onSave: (color: string) => void;
    isOpen: boolean;
    onClose: () => void;
    showPricing: (force?: boolean) => boolean;
};

export const CustomColorModal: FC<CustomColorModalProps> = ({ onSave, isOpen, onClose, showPricing }): ReactElement => {
    const [color, setColor] = useState('#00ffff');

    const onClickPremium = () => {
        showPricing(true);
    };

    const onClickSave = () => {
        if (showPricing()) {
            onSave(color);
            onClose();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialRef = React.useRef<any>();

    return (
        <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Custom Color</Center>
                    <Center>
                        <Button size="sm" leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={onClickPremium}>
                            Premium
                        </Button>
                    </Center>
                </ModalHeader>
                <ModalBody w="full">
                    <HexColorPicker
                        style={{ width: '100%' }}
                        className="responsive"
                        color={color}
                        onChange={(newColor) => {
                            setColor(newColor);
                        }}
                    />
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup w="full">
                        <Button onClick={onClose} w="full">
                            Cancel
                        </Button>
                        <Button ref={initialRef} w="full" colorScheme="green" onClick={onClickSave}>
                            Save
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
