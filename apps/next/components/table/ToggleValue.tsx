import { Box, useBoolean } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

type ToggleValueProps = {
    hidden: React.ReactNode;
    children?: React.ReactNode;
};

export const ToggleValue: FC<ToggleValueProps> = ({ hidden, children }): ReactElement => {
    const [show, { toggle }] = useBoolean(false);

    return <Box onClick={toggle}>{show ? children : hidden}</Box>;
};
