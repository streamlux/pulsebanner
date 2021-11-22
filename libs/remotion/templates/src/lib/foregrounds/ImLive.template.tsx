import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const ImLive: Layer<typeof ForegroundComponents.ImLive> = {
    component: ForegroundComponents.ImLive,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
        text: "I'm live on Twitch!",
        arrow: true,
        thumbnailBorderColor: 'rgb(145, 71, 255)',
        fontColor: '#ffffff',
        showText: true,
    },
    name: 'Live stream',
    description: 'Twitch stream description',
    form: ForegroundForms.ImLive,
};
