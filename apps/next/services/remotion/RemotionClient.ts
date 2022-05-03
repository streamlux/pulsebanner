import { remotionAxios } from '@app/util/axios';
import { RenderProps } from '@pulsebanner/remotion/types';
import type { AxiosInstance, AxiosResponse } from 'axios'
import { Context } from '../Context';

export interface RenderResponse extends AxiosResponse<string> {
    /**
     * Base64 encoded image
     */
    data: string;
};

class RemotionRequest {
    protected readonly axios: AxiosInstance = remotionAxios;

    public constructor(protected readonly context: Context, protected readonly props: RenderProps, protected path: string) { }

    public async send(): Promise<RenderResponse> {
        return await this.axios.post(this.path, {
            userId: this.context.userId,
            contextId: this.context.id,
            props: this.props
        });
    }
}

export class RenderBannerRequest extends RemotionRequest {
    public constructor(protected readonly context: Context, protected readonly props: RenderProps) {
        super(context, props, '/getTemplate');
    }
}

export class RenderProfilePicRequest extends RemotionRequest {
    public constructor(protected readonly context: Context, protected readonly props: RenderProps) {
        super(context, props, '/getProfilePic');
    }
}
