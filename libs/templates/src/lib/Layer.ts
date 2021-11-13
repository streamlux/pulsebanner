import React, { JSXElementConstructor } from "react";

export type LayerForm<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = React.FC<{ props: React.ComponentProps<P>, setProps: (props: React.ComponentProps<P>) => void }>;
export type LayerFormProps<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = React.ComponentProps<LayerForm<P>>

export type Layer<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = {
    component: React.FC<React.ComponentProps<P>>;
    defaultProps: React.ComponentProps<P>;
    name: string;
    description?: string;
    form: LayerForm<P>;
};
