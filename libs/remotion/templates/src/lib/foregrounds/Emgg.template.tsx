import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const Emgg: Layer<typeof ForegroundComponents.Emgg> = {
    component: ForegroundComponents.Emgg,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_sgt_jackson12-440x248.jpg',
        text: "I'm live on Twitch!",
        showUsername: true,
        username: 'Username Here!',
        watermark: true,
    },
    name: 'EMGG',
    description: 'Twitch stream description',
    form: ForegroundForms.Emgg,
};
