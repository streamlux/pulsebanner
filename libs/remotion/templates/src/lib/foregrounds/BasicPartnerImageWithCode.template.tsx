import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const BasicPartnerImageWithCode: Layer<typeof ForegroundComponents.BasicPartnerImageWithCode> = {
    component: ForegroundComponents.BasicPartnerImageWithCode,
    defaultProps: {
        discountCode: 'Discount Code',
        twitchName: 'Username Here!',
        twitterName: 'Twitter name here!',
    },
    name: 'New Partner',
    description: 'Partner image for partner to share',
    form: ForegroundForms.BasicPartnerImageWithCode,
};
