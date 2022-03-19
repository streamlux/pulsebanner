import { CheckIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useClipboard, Tag, HStack, Link, Tooltip, Text, Button, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';

type IdTagProps = {
    id: string;
    url?: string;
    urlTooltip?: string;
    noCopy?: boolean;
    alias?: string;
    copyValue?: string;
};

export const IdTag = ({ id, url = '#', noCopy, urlTooltip, alias: pretty, copyValue }: IdTagProps): React.ReactElement => {
    copyValue ??= id;

    const clipboard = useClipboard(copyValue);
    const label = (
        <>
            {id}
            {pretty && ` (${pretty})`}
        </>
    );
    const link = (
        <NextLink href={url} passHref>
            <Button as="a" target="_blank" variant="link" size="xs">
                <Tooltip fontSize="xs" placement="top" label={urlTooltip}>
                    {label}
                </Tooltip>
            </Button>
        </NextLink>
    );

    return (
        <Tag fontSize={'xs'}>
            <HStack>
                {url ? (
                    link
                ) : (
                    <Text whiteSpace={'nowrap'} variant="link">
                        {label}
                    </Text>
                )}
                {!noCopy &&
                    (clipboard.hasCopied ? (
                        <CheckIcon />
                    ) : (
                        <Tooltip placement="top" fontSize={'xs'} label="Copy ID">
                            <CopyIcon onClick={clipboard.onCopy} />
                        </Tooltip>
                    ))}
            </HStack>
        </Tag>
    );
};
