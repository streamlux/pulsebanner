import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const HolidayImageBackground: Layer<typeof BackgroundComponents.HolidayImageBackground> = {
    name: 'Holiday Image',
    description: 'Select a holiday image as the background',
    component: BackgroundComponents.HolidayImageBackground,
    form: BackgroundForms.HolidayImageBackground,
    defaultProps: {
        src: 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500',
    },
};
