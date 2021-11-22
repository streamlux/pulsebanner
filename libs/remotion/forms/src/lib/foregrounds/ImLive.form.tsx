import { Box, Checkbox, FormControl, FormLabel, Input, Select, VStack } from '@chakra-ui/react';
import { CustomColorPicker } from '@pulsebanner/react/color';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ComponentProps } from 'react';
import { LayerForm } from '../LayerForm';

export const ImLive: LayerForm<typeof ForegroundComponents.ImLive> = ({ props, setProps, showPricing }) => {
    const colors = ['#234344', '#af56af', '#cf44aa', '#b149ff', '#00ffff'];
    const textColors = ['#ffffff', '#000000'];

    const onChangeProps = (newProps: Partial<ComponentProps<typeof ForegroundComponents.ImLive>>) => {
        setProps({
            ...props,
            ...newProps,
        });
    };

    return (
        <Box w="full" experimental_spaceY={2}>
            <FormControl id="email" w="full">
                <FormLabel>Text</FormLabel>
                <Input
                    maxLength={36}
                    maxWidth="xs"
                    type="text"
                    onChange={(e) => {
                        setProps({ ...props, text: e.target.value });
                    }}
                    defaultValue={props.text}
                />
            </FormControl>

            <Checkbox
                p="2"
                colorScheme="purple"
                isChecked={props.showText}
                size="lg"
                onChange={(e) => {
                    setProps({ ...props, showText: !props.showText });
                }}
            >
                Show text
            </Checkbox>

            <FormControl>
                <FormLabel>Text color</FormLabel>
                <CustomColorPicker hideCustom colors={textColors} color={props.fontColor} onChangeColor={(c) => onChangeProps({ fontColor: c })} showPricing={showPricing} />
            </FormControl>

            <Checkbox
                p="2"
                colorScheme="purple"
                isChecked={props.arrow}
                size="lg"
                onChange={(e) => {
                    setProps({ ...props, arrow: !props.arrow });
                }}
            >
                Show arrow
            </Checkbox>
            <FormControl>
                <FormLabel>Thumbnail border color</FormLabel>
                <CustomColorPicker
                    hideCustom
                    colors={colors}
                    color={props.thumbnailBorderColor}
                    onChangeColor={(c) => onChangeProps({ thumbnailBorderColor: c })}
                    showPricing={showPricing}
                />
            </FormControl>
        </Box>
    );
};
