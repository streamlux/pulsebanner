import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../../Layer';

export const Schedule: Layer<typeof ForegroundComponents.Schedule> = {
    component: ForegroundComponents.Schedule,
    defaultProps: {
        events: [],
        watermark: true,
    },
    name: 'Stream schedule',
    form: ForegroundForms.Schedule,
};
