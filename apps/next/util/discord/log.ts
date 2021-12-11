import { sendMessage } from "./sendMessage";

const webhookUrl: string = process.env.DISCORD_LOGS_WEBHOOK_URL;

function chunkSubstr(str: string, size: number): string[] {
    const numChunks: number = Math.ceil(str.length / size);
    const chunks: string[] = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substring(o, size);
    }

    return chunks;
}

export function log(...data: any[]) {
    // log to console
    console.log(...data);

    const timestamp: string = new Date().toISOString();

    const rawContent: string = data.join(' ');
    const withStamps: string[] = rawContent.split('\n');
    const content = timestamp + ': ' + withStamps.join(`\n${timestamp}: `);

    // log to discord
    const chunkedContent = chunkSubstr(content, 1999 - 10); // 2000 is the limit, then subtract ten for the code block backticks, and 1999 just to be safe
    chunkedContent.forEach((chunk: string) => {
        // wrap with ``` to make it a codeblock in discord
        const codeBlockChunk = "```\n" + chunkedContent + "\n```";
        sendMessage(codeBlockChunk, webhookUrl);
    });
}
