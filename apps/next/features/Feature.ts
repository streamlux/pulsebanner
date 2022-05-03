import { Context } from "@app/services/Context";

export type Feature<T> = (context: Context) => Promise<T>;
