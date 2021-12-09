import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, FormControl, FormLabel, HStack, Text, VStack } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const HolidayImageBackground: LayerForm<typeof BackgroundComponents.HolidayImageBackground> = ({ props, setProps, showPricing, availableFeature }) => {
    return (
        <Box w="full">
            <FormControl>
                <FormLabel>
                    <VStack align="start">
                        <HStack>
                            <Text>Holiday Backgrounds</Text>
                            <Button size="md" leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing()}>
                                Premium
                            </Button>
                        </HStack>
                        <ButtonGroup isDisabled={availableFeature}>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/dogsled.png' })}>Dogsled</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/holly.png' })}>Holly</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/ornaments.png' })}>Ornaments</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/presents.png' })}>Presents</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/snowhouse.png' })}>Snow house</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: 'https://winterholiday.sfo3.digitaloceanspaces.com/snowy-lake.png' })}>Snowy Lake</Button>
                        </ButtonGroup>
                    </VStack>
                </FormLabel>
            </FormControl>
        </Box>
    );
};
