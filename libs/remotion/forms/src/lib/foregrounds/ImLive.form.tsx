import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Checkbox, FormControl, FormLabel, HStack, Text, Input, Select, Wrap, WrapItem } from '@chakra-ui/react';
import { CustomColorPicker } from '@pulsebanner/react/color';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ComponentProps } from 'react';
import { LayerForm } from '../LayerForm';

const fontList = ['Bangers', 'Quicksand', 'Akronim', 'Lacquer', 'Iceland', 'Langar'];

export const ImLive: LayerForm<typeof ForegroundComponents.ImLive> = ({ props, setProps, availableFeature, showPricing }) => {
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
            <Wrap spacing={4}>
                <WrapItem>
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
                </WrapItem>
                <WrapItem>
                    <FormControl>
                        <FormLabel>Text color</FormLabel>
                        <CustomColorPicker
                            hideCustom
                            colors={textColors}
                            color={props.fontColor}
                            onChangeColor={(c) => onChangeProps({ fontColor: c })}
                            showPricing={showPricing}
                        />
                    </FormControl>
                </WrapItem>
            </Wrap>
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
            <Checkbox
                p="2"
                colorScheme="purple"
                isChecked={props.showUsername}
                size="lg"
                onChange={(e) => {
                    setProps({ ...props, showUsername: !props.showUsername, username: props.username });
                }}
            >
                Show username
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
            <FormControl>
                <FormLabel>
                    <HStack>
                        <Text>Text Font</Text>
                        <Button size="md" leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing()}>
                            Premium
                        </Button>
                    </HStack>
                </FormLabel>
                <Select
                    disabled={!availableFeature}
                    defaultValue="Default"
                    onChange={(e) => {
                        setProps({ ...props, fontStyle: e.target.value });
                    }}
                >
                    <option value="">Default</option>
                    {fontList.map((fontString: string) => {
                        return <option value={fontString}>{fontString}</option>;
                    })}
                </Select>
            </FormControl>
        </Box>
    );
};
