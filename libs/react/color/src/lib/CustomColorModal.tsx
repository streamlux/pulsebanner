import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ButtonGroup,
    Button,
    Center,
    Input,
    VStack,
    FormControl,
    FormLabel,
    HStack,
} from '@chakra-ui/react';
import React, { ReactElement, FC, useState } from 'react';
import { StarIcon } from '@chakra-ui/icons';
import { HexColorPicker } from 'react-colorful';

type CustomColorModalProps = {
    onSave: (color: string) => void;
    isOpen: boolean;
    onClose: () => void;
    showPricing: (force?: boolean) => boolean;
    availableFeature: boolean;
};

export const CustomColorModal: FC<CustomColorModalProps> = ({ onSave, isOpen, onClose, showPricing, availableFeature }): ReactElement => {
    const [color, setColor] = useState('#00ffff');

    const onClickPremium = () => {
        showPricing(true);
    };

    const onClickSave = () => {
        if (!availableFeature) {
            showPricing(true);
        } else {
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
                    <VStack spacing={6}>
                        <HexColorPicker
                            style={{ width: '100%' }}
                            className="responsive"
                            color={color}
                            onChange={(newColor) => {
                                setColor(newColor);
                            }}
                        />
                        <FormControl w='full'>
                            <Center w='full'>
                                <HStack>
                                    <FormLabel htmlFor="email">Hex color</FormLabel>
                                    <Input w="28" type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#00ffff" />
                                </HStack>
                            </Center>
                        </FormControl>
                    </VStack>
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
