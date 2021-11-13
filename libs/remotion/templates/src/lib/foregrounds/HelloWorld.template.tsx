import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { Layer } from '../Layer';

export const HelloWorld: Layer<typeof ForegroundComponents.HelloWorld> = {
    component: ForegroundComponents.HelloWorld,
    defaultProps: {},
    name: 'hello world',
    form: ({ props, setProps }) => <p>hello world forms</p>,
};
