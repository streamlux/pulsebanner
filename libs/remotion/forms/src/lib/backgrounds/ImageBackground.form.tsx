import { Box, Button, ButtonGroup, FormControl, FormHelperText, FormLabel, HStack, IconButton, Text, useBreakpoint, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { StarIcon } from '@chakra-ui/icons';
import { FileUploadModal } from '@pulsebanner/react-image-upload';

const sampleImageMap: Record<string, string> = {
    Sky: 'http://2.bp.blogspot.com/-QkeZcIm3X_g/VJRzwWkYfXI/AAAAAAAAJWg/HhIgNTT6PtM/s1600/clouds-1500x500-twitter-header-04.jpg',
    Rainbow: 'https://www.designbolts.com/wp-content/uploads/2014/06/Colorful-twitter-header-banner.jpg',
    Night: 'http://1.bp.blogspot.com/-K4otZmbNpuE/U5cZmaTVi8I/AAAAAAAAHZk/PSq3iuY9zdA/s1600/twitter-header-1500x500-nature+(1).jpg',
};

export const ImageBackground: LayerForm<typeof BackgroundComponents.ImageBackground> = ({ props, setProps, showPricing, accountLevel }) => {
    const toast = useToast();
    const { isOpen, onClose, onOpen } = useDisclosure();
    const breakpoint = useBreakpoint();

    return (
        <Box w="full">
            <FormControl id="url">
                <FormLabel>
                    <VStack align="start">
                        <Text>Sample images</Text>
                        <ButtonGroup>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Sky'] })}>Sky</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Rainbow'] })}>Rainbow</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Night'] })}>Night</Button>
                        </ButtonGroup>
                    </VStack>
                </FormLabel>
                <FormLabel>
                    <HStack>
                        <Text>Custom background image</Text>
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
                <Button onClick={accountLevel === 'Free' ? () => showPricing(true) : onOpen}>Upload image</Button>
                <FileUploadModal
                    onUpload={(url) => {
                        setProps({ ...(props ?? {}), src: `${url}?r=${Date.now().toString()}` });
                        toast({
                            status: 'success',
                            title: 'Background image uploaded',
                            position: 'top',
                        });
                    }}
                    url="/api/features/banner/upload?folder=backgrounds"
                    isOpen={isOpen}
                    onClose={onClose}
                    title="Upload banner background"
                />
                <FormHelperText>Image size should be exactly 1500x500 for best appearance.</FormHelperText>
            </FormControl>
        </Box>
    );
};
