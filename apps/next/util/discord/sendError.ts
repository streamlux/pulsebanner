import env from '../env';
import { sendMessage } from './sendMessage';

export function sendError(e: Error, context: string) {
    sendMessage(`Error - ${context}\n ${JSON.stringify(e)}`, env.DISCORD_ERROR_WEBHOOK_URL);
}

export function sendErrorInternal(context: string) {
    sendMessage(`Internal API Error - ${context}`, env.DISCORD_ERROR_WEBHOOK_URL);
}
