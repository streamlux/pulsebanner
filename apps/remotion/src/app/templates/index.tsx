import { registerRoot } from 'remotion';
import { RemotionProfilePicture, RemotionVideo, RemotionPartnerMediaKit } from './Stills';

registerRoot(() => {
    return (
        <>
            <RemotionVideo />
            <RemotionProfilePicture />
            <RemotionPartnerMediaKit />
        </>
    );
});
