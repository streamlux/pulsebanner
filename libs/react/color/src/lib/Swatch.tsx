import { Box, Button, useBreakpointValue } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

type SwatchProps = {
    color: string;
    onClick?: () => void;
    selected?: boolean;
};

export const Swatch: FC<SwatchProps> = ({ color, onClick, selected }): ReactElement => {
    const size = useBreakpointValue(['sm', 'md']);
    return (
        <Button
            border="2px"
            borderColor="blackAlpha.200"
            onClick={onClick}
            variant="ghost"
            size={size}
            _hover={{ bg: color }}
            _focus={{ ring: '3px', ringColor: 'blue.200', ringInset: 'inset' }}
            _active={{ bg: color }}
            bg={color}
            ringColor={selected ? 'blue.200' : color}
            ring={selected ? '3px' : 0}
            ringOffset="0px"
            ringInset="inset"
            ringOffsetColor={color}
            rounded="lg"
        />
    );
};
