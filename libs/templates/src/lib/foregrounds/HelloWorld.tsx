import React from 'react';
import { Layer } from '../Layer';
import { Box, Center } from '@chakra-ui/react';

const HelloWorld: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center' }}>
                <Center w="full" zIndex={10}>
                    <h1>Hello, world!</h1>
                </Center>
            </div>
        </div>
    );
};

export default {
    component: HelloWorld,
    defaultProps: {},
    form: () => <p>Form</p>,
    name: 'hello world',
} as Layer<typeof HelloWorld>;
