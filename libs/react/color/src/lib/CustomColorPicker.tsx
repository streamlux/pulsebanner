import { Box, HStack, Button, useDisclosure, Stack } from '@chakra-ui/react';
import React, { ReactElement, FC, useState } from 'react';
import { SwatchGroup, CustomColorModal } from '../index';
import { CgColorPicker } from 'react-icons/cg';

type CustomColorPickerProps = {
    colors: string[];
    color: string;
    onChangeColor: (color: string) => void;
    showPricing: (force?: boolean) => boolean;
    hideCustom?: boolean;
};

export const CustomColorPicker: FC<CustomColorPickerProps> = ({ colors, color, onChangeColor, showPricing, hideCustom }): ReactElement => {
    const [customColor, setCustomColor] = useState('#0fffff');
    const swatchColors = [...colors];
    if (!hideCustom) {
        swatchColors.push(customColor);
    }

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const onCustomColor = () => {
        onModalOpen();
    };
    return (
        <Box>
            <Stack direction={['column', 'row']}>
                <SwatchGroup
                    colors={swatchColors}
                    onChange={(color) => {
                        onChangeColor(color);
                    }}
                    value={color}
                />
                <Button w="fit-content" aria-label="Color picker" leftIcon={<CgColorPicker />} onClick={onCustomColor}>
                    Custom
                </Button>
            </Stack>

            <CustomColorModal
                isOpen={isModalOpen}
                onSave={(color) => {
                    setCustomColor(color);
                    onChangeColor(color);
                }}
                showPricing={showPricing}
                onClose={onModalClose}
            />
        </Box>
    );
};
