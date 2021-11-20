import { useDisclosure } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useConnectToTwitch() {
    const { data: session } = useSession({ required: false }) as any;
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { modal } = router.query;

    useEffect(() => {
        if (modal === 'true') {
            if (session && (!session?.accounts?.twitch || !session?.accounts?.twitter)) {
                onOpen();
            }
            router.replace('/banner');
        }
    }, [modal, router, onOpen, session, onClose]);

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
        onOpen
    }
}
