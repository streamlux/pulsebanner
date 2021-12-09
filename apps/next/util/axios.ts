import axios, { AxiosError } from "axios";

export const twitchAxios = axios.create({
    baseURL: 'https://api.twitch.tv'
});

twitchAxios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error: AxiosError) {

    const errorLogs: string[] = ['Error occured during request (twitch axios)'];

    errorLogs.push(`${error.config.method?.toUpperCase()} ${error.config.url}`);
    errorLogs.push(`Error message: ${error.message}`);
    errorLogs.push(`Axios request config: ${JSON.stringify(error.config, null, 2)}`);

    console.log(errorLogs.join('\n'));

    if (process.env.ENABLE_DISCORD_WEBHOOKS) {
        axios.post(process.env.DISCORD_ERROR_WEBHOOK_URL, {
            content: errorLogs.join('\n'),
        });
    }
});

export const localAxios = axios.create({
    baseURL: process.env.NEXTAUTH_URL
});

localAxios.interceptors.response.use(undefined, (error: AxiosError) => {
    console.error('Error occured during request (local)');
    console.error(`${error.config.method?.toUpperCase()} ${error.config.url}`);
    console.error(error.message);
})

export const remotionAxios = axios.create({
    baseURL: process.env.REMOTION_URL
});
