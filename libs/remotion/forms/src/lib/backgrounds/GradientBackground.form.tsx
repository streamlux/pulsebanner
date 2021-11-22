import { Box, FormControl, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { ComponentProps } from 'react';
import { CustomColorPicker } from '@pulsebanner/react/color';

type Component = typeof BackgroundComponents.GradientBackground;

export const GradientBackground: LayerForm<Component> = ({ props, setProps, showPricing }) => {
    const colors = ['#eb7734', '#af56af', '#cf44aa', '#b149ff', '#00ffff'];

    const onChangeProps = (newProps: Partial<ComponentProps<Component>>) => {
        setProps({
            ...props,
            ...newProps,
        });
    };

    return (
        <Box>
            <SimpleGrid columns={[1, 2]} spacing={[2, 4]}>
                <FormControl>
                    <FormLabel>Left color</FormLabel>
                    <CustomColorPicker hideCustom colors={colors} color={props.leftColor} onChangeColor={(c) => onChangeProps({ leftColor: c })} showPricing={showPricing} />
                </FormControl>
                <FormControl>
                    <FormLabel>Right color</FormLabel>
                    <CustomColorPicker hideCustom colors={colors} color={props.rightColor} onChangeColor={(c) => onChangeProps({ rightColor: c })} showPricing={showPricing} />
                </FormControl>
            </SimpleGrid>
        </Box>
    );
};
