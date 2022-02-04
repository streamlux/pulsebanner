import React from 'react';
import { Box, Link, ListItem, UnorderedList } from '@chakra-ui/react';
import { Panel } from './Panel';
import { ExternalLinkIcon } from '@chakra-ui/icons';

export const QuickLinks: React.FC = () => (
    <Panel name="Quick links">
        <Box>
            <UnorderedList>
                <ListItem>
                    <Link isExternal href="/admin/user">
                        User dashboard
                    </Link>
                </ListItem>
                <ListItem>
                    <Link isExternal href="/admin/webhooks">
                        Webhooks dashboard
                    </Link>
                </ListItem>
                <ListItem>
                    <Link isExternal href="/admin/partner">
                        Partner Dashboard
                    </Link>
                </ListItem>
                <ListItem>
                    <Link isExternal href="/api/admin/adminer">
                        Adminer
                        <ExternalLinkIcon mx="2px" />
                    </Link>
                </ListItem>
                <ListItem>
                    <Link isExternal href="/api/admin/analytics">
                        Analytics
                        <ExternalLinkIcon mx="2px" />
                    </Link>
                </ListItem>
            </UnorderedList>
        </Box>
    </Panel>
);
