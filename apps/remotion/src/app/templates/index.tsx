import { registerRoot } from 'remotion';
import { RemotionProfilePicture, RemotionVideo } from './Stills';

registerRoot(() => {
    return (
        <>
            <RemotionVideo />
            <RemotionProfilePicture />;
        </>
    );
});
