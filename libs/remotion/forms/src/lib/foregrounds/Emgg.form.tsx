import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, Text, Input, Select, Wrap, WrapItem, Tag, IconButton, useBreakpoint } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ComponentProps } from 'react';
import { LayerForm } from '../LayerForm';

const fontList = ['Bangers', 'Quicksand', 'Akronim', 'Lacquer', 'Iceland', 'Langar'];

export const Emgg: LayerForm<typeof ForegroundComponents.Emgg> = ({ props, setProps, showPricing, accountLevel }) => {
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
