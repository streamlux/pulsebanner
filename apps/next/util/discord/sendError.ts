import { sendMessage } from "./sendMessage";

export function sendError(e: Error, context: string) {
    sendMessage(`Error - ${context}\n ${JSON.stringify(e)}`, process.env.DISCORD_ERROR_WEBHOOK_URL);
}
