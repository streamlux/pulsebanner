import { Box, FormControl, FormLabel, useDisclosure } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { CustomColorPicker } from '@pulsebanner/react/color';
import { ComponentProps } from 'react';

export const ColorBackground: LayerForm<typeof BackgroundComponents.ColorBackground> = ({ props, setProps, showPricing }) => {
    const colors = ['#eb7734', '#af56af', '#cf44aa', '#b149ff', '#00ffff'];

    const onChangeProps = (newProps: Partial<ComponentProps<typeof BackgroundComponents.ColorBackground>>) => {
        setProps({
            ...props,
            ...newProps,
        });
    };

    return (
        <Box>
            <FormControl>
                <FormLabel>Color</FormLabel>
                <CustomColorPicker hideCustom colors={colors} color={props.color} onChangeColor={(c) => onChangeProps({ color: c })} showPricing={showPricing} />
            </FormControl>
        </Box>
    );
};
