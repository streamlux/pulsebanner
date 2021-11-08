import React from 'react';
import { Box, Button, ButtonGroup, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Panel } from './Panel';

export const Database: React.FC = () => (
    <Panel name="Database">
        <Box>
            <ButtonGroup>
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
                    <Button rightIcon={<ExternalLinkIcon mx="2px" />}>Open Adminer</Button>
                </Link>
            </ButtonGroup>
        </Box>
    </Panel>
);
