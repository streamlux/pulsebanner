import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const SolidBackground: Layer<typeof BackgroundComponents.SolidBackground> = {
    name: 'Color',
    description: 'Make your background a solid color',
    component: BackgroundComponents.SolidBackground,
    form: BackgroundForms.SolidBackground,
    defaultProps: {
        color: '#b149ff',
    },
};
