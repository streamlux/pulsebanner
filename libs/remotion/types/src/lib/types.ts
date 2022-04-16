export type RenderProps = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

export type RemotionRequestBody = {
    userId: string;
    contextId: string;
    props: RenderProps;
};
