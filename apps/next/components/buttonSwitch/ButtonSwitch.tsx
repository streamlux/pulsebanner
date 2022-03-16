import { Center, LightMode, Tab, TabList, Tabs, Tag, VStack, Text } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

type ButtonSwitchProps = {
    onChange: (index: number) => void;
    defaultIndex?: number;
};

export const ButtonSwitch: FC<ButtonSwitchProps> = ({ onChange, defaultIndex, children }): ReactElement => {
    return (
        <Tabs variant="enclosed" colorScheme={'gray'} rounded="xl" border="none" borderWidth={0} bg="transparent" defaultIndex={defaultIndex} onChange={onChange}>
            <TabList h="16" borderWidth={0} w={['auto', 'full']} bg={'whiteAlpha.400'} rounded="xl">
                <Tab rounded="xl" w="50%" fontWeight={'bold'} m="0" textColor={'whiteAlpha.800'} _selected={{ bg: 'whiteAlpha.800', color: 'gray.800' }}>
                    {children[0]}
                </Tab>
                <Tab m="0" fontWeight={'bold'} rounded="xl" w="50%" textColor={'whiteAlpha.800'} _selected={{ bg: 'whiteAlpha.800', color: 'gray.800' }}>
                    {children[1]}
                </Tab>
            </TabList>
        </Tabs>
    );
};
