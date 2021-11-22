import { Wrap, WrapItem } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import { Swatch } from './Swatch';

type SwatchGroupProps = {
    colors: string[];
    onChange: (color: string) => void;
    value: string;
};

export const SwatchGroup: FC<SwatchGroupProps> = ({ colors, onChange, value }): ReactElement => {
    return (
        <Wrap spacing="2">
            {colors.map((color) => (
                <WrapItem key={color}>
                    <Swatch key={color} color={color} onClick={() => onChange(color)} selected={color === value} />
                </WrapItem>
            ))}
        </Wrap>
    );
};
