import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const ImageBackground: Layer<typeof BackgroundComponents.ImageBackground> = {
    name: 'Image',
    description: 'Use any image as a background',
    component: BackgroundComponents.ImageBackground,
    form: BackgroundForms.ImageBackground,
    defaultProps: {
        src: 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500',
    },
};
