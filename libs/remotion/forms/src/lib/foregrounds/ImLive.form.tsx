import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, Text, Input, Select, Wrap, WrapItem, Tag, IconButton, useBreakpoint } from '@chakra-ui/react';
import { CustomColorPicker } from '@pulsebanner/react/color';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ComponentProps } from 'react';
import { LayerForm } from '../LayerForm';

const fontList = ['Bangers', 'Quicksand', 'Akronim', 'Lacquer', 'Iceland', 'Langar'];

export const ImLive: LayerForm<typeof ForegroundComponents.ImLive> = ({ props, setProps, showPricing, accountLevel }) => {
    const colors = ['#234344', '#af56af', '#cf44aa', '#b149ff', '#00ffff'];
    const textColors = ['#ffffff', '#000000'];
    const breakpoint = useBreakpoint();

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
                            availableFeature={accountLevel !== 'Free'}
                        />
                    </FormControl>
                </WrapItem>
            </Wrap>
            <FormControl>
                <FormLabel>
                    <HStack>
                        <Text>Text Font</Text>
                        <Box>
                            {breakpoint === 'base' && (
                                <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)} />
                            )}
                            {breakpoint !== 'base' && (
                                <Button leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)}>
                                    Premium
                                </Button>
                            )}
                        </Box>
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
            <HStack spacing={0}>
                <Checkbox
                    p="2"
                    colorScheme="purple"
                    isChecked={props.showUsername}
                    size="lg"
                    onChange={(e) => {
                        setProps({ ...props, showUsername: !props.showUsername });
                    }}
                >
                    Display username
                </Checkbox>
            </HStack>

            <FormControl>
                <FormLabel>Thumbnail border color</FormLabel>
                <CustomColorPicker
                    hideCustom
                    colors={colors}
                    color={props.thumbnailBorderColor}
                    onChangeColor={(c) => onChangeProps({ thumbnailBorderColor: c })}
                    showPricing={showPricing}
                    availableFeature={accountLevel !== 'Free'}
                />
            </FormControl>
            <HStack>
                <Checkbox
                    colorScheme="purple"
                    defaultChecked={true}
                    isChecked={props.watermark}
                    size="lg"
                    onChange={(e) => {
                        e.preventDefault();
                        if (accountLevel !== 'Professional') {
                            showPricing(true);
                        } else {
                            setProps({ ...props, watermark: !props.watermark });
                        }
                    }}
                >
                    Show watermark
                </Checkbox>
                <Box>
                    {breakpoint === 'base' && <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)} />}
                    {breakpoint !== 'base' && (
                        <Button leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)}>
                            Premium
                        </Button>
                    )}
                </Box>
            </HStack>
        </Box>
    );
};
