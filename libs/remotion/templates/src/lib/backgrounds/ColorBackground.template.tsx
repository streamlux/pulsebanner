import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const ColorBackground: Layer<typeof BackgroundComponents.ColorBackground> = {
    name: 'Color',
    description: 'Make your background a solid color',
    component: BackgroundComponents.ColorBackground,
    form: BackgroundForms.ColorBackground,
    defaultProps: {
        color: '#b149ff',
    },
};
