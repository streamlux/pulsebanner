import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const CSSBackground: Layer<typeof BackgroundComponents.CSSBackground> = {
    name: 'Image background',
    description: 'Use any image as a background',
    component: BackgroundComponents.CSSBackground,
    form: BackgroundForms.CSSBackground,
    defaultProps: {
        style: {
            height: '100%',
            width: '100%',
            background: 'linear-gradient(to right, #b149ff 0%, #00ffff 100%)',
        },
    },
};
