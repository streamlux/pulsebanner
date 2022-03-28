import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { ForegroundForms } from '@pulsebanner/remotion/forms';
import { Layer } from '../Layer';

export const PartnerCodeWithMembershipImage: Layer<typeof ForegroundComponents.PartnerCodeWithMembershipImage> = {
    component: ForegroundComponents.PartnerCodeWithMembershipImage,
    defaultProps: {
        discountCode: 'Discount Code',
        username: 'Username Here!',
        // twitchUsername: 'test',
    },
    name: 'New Partner',
    description: 'Partner image for partner to share',
    form: ForegroundForms.PartnerCodeWithMembershipImage,
};
