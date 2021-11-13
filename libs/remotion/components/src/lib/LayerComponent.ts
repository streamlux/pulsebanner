import React from "react";

export type LayerComponent<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = {
    component: React.FC<React.ComponentProps<P>>;
};
