import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const TwitchStream: Layer<typeof ForegroundComponents.TwitchStream> = {
    component: ForegroundComponents.TwitchStream,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    },
    name: 'Twitch stream',
    description: 'Twitch stream description',
    form: ForegroundForms.TwitchStream,
};
