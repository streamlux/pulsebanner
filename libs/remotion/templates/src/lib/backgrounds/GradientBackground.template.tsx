import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { BackgroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const GradientBackground: Layer<typeof BackgroundComponents.GradientBackground> = {
    name: 'Gradient',
    description: 'Make your background a color gradient',
    component: BackgroundComponents.GradientBackground,
    form: BackgroundForms.GradientBackground,
    defaultProps: {
        rightColor: '#b149ff',
        leftColor: '#00ffff',
    },
};
