import { useDisclosure } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useConnectToTwitch(callbackUrl?: string) {
    const { data: session, status } = useSession({ required: false }) as any;
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { modal } = router.query;

    useEffect(() => {
        if (modal === 'true' && status !== 'loading') {
            if (session && (!session?.accounts?.twitch || !session?.accounts?.twitter)) {
                onOpen();
            }
            router.replace(callbackUrl ?? '/banner');
        }
    }, [modal, router, onOpen, session, onClose, status, callbackUrl]);

    const ensureSignUp = () => {
        if (session?.accounts?.twitch && session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    };

    return {
        session,
        ensureSignUp,
        isOpen,
        onClose,
        onOpen,
    };
}
