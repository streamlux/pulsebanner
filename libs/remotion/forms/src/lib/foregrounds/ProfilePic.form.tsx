import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, IconButton, Input, Text, Select, Tag, useBreakpoint, Wrap, WrapItem, SimpleGrid, Heading } from '@chakra-ui/react';
import { CustomColorPicker } from '@pulsebanner/react/color';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ComponentProps } from 'react';
import { LayerForm } from '../LayerForm';

const fontList = ['Bangers', 'Quicksand', 'Akronim', 'Lacquer', 'Iceland', 'Langar'];

export const ProfilePic: LayerForm<typeof ForegroundComponents.ProfilePic> = ({ props, setProps, showPricing, accountLevel }) => {
    const colors = ['#f90', 'crimson', '#ff0000', '#af56af', '#cf44aa', '#b149ff', '#00ffff'];
    const textColors = ['#ffffff', '#000000'];
    const breakpoint = useBreakpoint();

    const onChangeProps = (newProps: Partial<ComponentProps<typeof ForegroundComponents.ProfilePic>>) => {
        setProps({
            ...props,
            ...newProps,
        });
    };

    return (
        <Box w="full" experimental_spaceY={2}>
            <Text fontSize="xl">Border</Text>
            <SimpleGrid columns={[1, 2]} spacing={[2, 4]}>
                <FormControl>
                    <FormLabel>First color</FormLabel>
                    <CustomColorPicker
                        hideCustom
                        colors={colors}
                        color={props.color1}
                        onChangeColor={(c) => onChangeProps({ color1: c })}
                        showPricing={showPricing}
                        availableFeature={accountLevel !== 'Free'}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Second color</FormLabel>
                    <CustomColorPicker
                        hideCustom
                        colors={colors}
                        color={props.color2}
                        onChangeColor={(c) => onChangeProps({ color2: c })}
                        showPricing={showPricing}
                        availableFeature={accountLevel !== 'Free'}
                    />
                </FormControl>
            </SimpleGrid>
            <Text fontSize="xl">Text</Text>

            <SimpleGrid columns={[2, 2]} spacing={[2, 4]}>
                <FormControl id="email" w="full">
                    <FormLabel>Text</FormLabel>
                    <Input
                        maxLength={10}
                        maxWidth="24"
                        type="text"
                        onChange={(e) => {
                            setProps({ ...props, text: e.target.value });
                        }}
                        defaultValue={props.text}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>
                        <HStack>
                            <Text>Font</Text>
                        </HStack>
                    </FormLabel>
                    <Select
                        w="fit-content"
                        disabled={accountLevel === 'Free'}
                        defaultValue="Default"
                        onChange={(e) => {
                            setProps({ ...props, fontStyle: e.target.value });
                        }}
                    >
                        <option value="">Default</option>
                        {fontList.sort().map((fontString: string) => {
                            return (
                                <option key={fontString} value={fontString}>
                                    {fontString}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel>Text background color</FormLabel>
                    <CustomColorPicker
                        hideCustom
                        colors={['#ff0000', '#0000ff', '#9600ee']}
                        color={props.fontColor}
                        onChangeColor={(c) => onChangeProps({ liveBackgroundColor: c })}
                        showPricing={showPricing}
                        availableFeature={accountLevel !== 'Free'}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Text color</FormLabel>
                    <CustomColorPicker
                        hideCustom
                        colors={textColors}
                        color={props.fontColor}
                        onChangeColor={(c) => onChangeProps({ fontColor: c })}
                        showPricing={showPricing}
                        availableFeature={accountLevel !== 'Free'}
                    />
                </FormControl>
            </SimpleGrid>
            <Checkbox
                p="2"
                colorScheme="purple"
                isChecked={!props.showText}
                size="lg"
                onChange={(e) => {
                    setProps({ ...props, showText: !props.showText });
                }}
            >
                Hide text
            </Checkbox>
        </Box>
    );
};
