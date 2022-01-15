import { Box, HStack, Button, useDisclosure, Stack, Wrap, WrapItem } from '@chakra-ui/react';
import React, { ReactElement, FC, useState } from 'react';
import { SwatchGroup, CustomColorModal } from '../index';
import { CgColorPicker } from 'react-icons/cg';

type CustomColorPickerProps = {
    colors: string[];
    color: string;
    onChangeColor: (color: string) => void;
    showPricing: (force?: boolean) => boolean;
    hideCustom?: boolean;
    availableFeature: boolean;
};

export const CustomColorPicker: FC<CustomColorPickerProps> = ({ colors, color, onChangeColor, showPricing, hideCustom, availableFeature }): ReactElement => {
    const swatchColors = [...colors];
    const [customColor, setCustomColor] = useState('');
    if (!hideCustom) {
        swatchColors.push(customColor);
    }

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const onCustomColor = () => {
        onModalOpen();
    };
    return (
        <Box>
            <Wrap>
                <WrapItem>
                    <SwatchGroup
                        colors={swatchColors}
                        onChange={(color) => {
                            onChangeColor(color);
                        }}
                        value={color}
                    />
                </WrapItem>
                <WrapItem>
                    <Button w="fit-content" aria-label="Color picker" leftIcon={<CgColorPicker />} onClick={onCustomColor}>
                        Custom
                    </Button>
                </WrapItem>
            </Wrap>
            <Stack direction={['row', 'row']}></Stack>

            <CustomColorModal
                isOpen={isModalOpen}
                onSave={(color) => {
                    setCustomColor(color);
                    onChangeColor(color);
                }}
                showPricing={showPricing}
                onClose={onModalClose}
                availableFeature={availableFeature}
            />
        </Box>
    );
};
