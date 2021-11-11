import { Box, Button } from '@chakra-ui/react';
import React from 'react';
import { signIn } from 'next-auth/react';

export default function Page() {
    return (
        <>
            <Box>
                <Button onClick={() => signIn('twitter')}>Connect to Twitter</Button>
            </Box>
        </>
    );
}
