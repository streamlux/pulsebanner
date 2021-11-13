import React from 'react';
import { LayerComponent } from '../LayerComponent';

export const HelloWorld: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center' }}>
                <h1>Hello, world!</h1>
            </div>
        </div>
    );
};

const sh = {
    component: HelloWorld,
    defaultProps: {},
    name: 'hello world',
} as LayerComponent<typeof HelloWorld>;
