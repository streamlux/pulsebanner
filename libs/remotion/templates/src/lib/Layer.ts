import React from 'react';
import type { LayerForm } from '@pulsebanner/remotion/forms';
import type { LayerComponent } from '@pulsebanner/remotion/components';

export type Layer<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = {
    defaultProps: React.ComponentProps<P>;
    name: string;
    description?: string;
    form: LayerForm<P>;
} & LayerComponent<P>;
