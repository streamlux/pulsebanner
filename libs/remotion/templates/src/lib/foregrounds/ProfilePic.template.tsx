import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const ProfilePic: Layer<typeof ForegroundComponents.ProfilePic> = {
    component: ForegroundComponents.ProfilePic,
    defaultProps: {
        // thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
        text: 'Live',
        fontColor: '#ffffff',
        showText: true,
        fontStyle: '',
        color1: 'crimson',
        color2: '#f90',
        imageUrl: 'https://pbs.twimg.com/profile_images/1477190865613250560/bP4B0ImS_400x400.jpg',
        top: false,
        hideLive: false,
        liveBackgroundColor: 'red',
    },
    name: 'Live stream',
    description: 'Twitch stream description',
    form: ForegroundForms.ProfilePic,
};
