import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const PreGaming: Layer<typeof ForegroundComponents.PreGaming> = {
    component: ForegroundComponents.PreGaming,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
        text: "I'm live on Twitch!",
        showUsername: true,
        username: 'Username Here!',
        watermark: true,
    },
    name: 'PreGaming',
    description: 'Twitch stream description',
    form: ForegroundForms.Emgg,
};
