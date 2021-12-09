import axios from "axios";

/**
 *
 * Sends a message via discord webhook
 *
 * @param message Message to send
 */
export function sendMessage(message: string, webhookUrl: string) {
    if (process.env.ENABLE_DISCORD_WEBHOOKS === 'true') {
        axios.post(webhookUrl, {
            content: message
        });
    }
}
