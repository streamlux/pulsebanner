import React from 'react';
import { Box, Button, ButtonGroup, Link, Stack } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Panel } from './Panel';

export const Database: React.FC = () => (
    <Panel name="Database">
        <Box>
            <ButtonGroup w="full">
                <Stack direction={['column', 'row']} w="full">
                    <Button
                        onClick={() => {
                            fetch('/api/admin/seed', {
                                method: 'POST',
                            });
                        }}
                    >
                        Seed database
                    </Button>
                    <Link href="/api/admin/adminer">
                        <Button rightIcon={<ExternalLinkIcon mx="2px" />} isFullWidth={true}>
                            Open Adminer
                        </Button>
                    </Link>
                </Stack>
            </ButtonGroup>
        </Box>
    </Panel>
);
