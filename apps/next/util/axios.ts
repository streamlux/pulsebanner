import axios, { AxiosError } from "axios";

export const twitchAxios = axios.create({
    baseURL: 'https://api.twitch.tv'
});

twitchAxios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error: AxiosError) {
    // Do something with the error
    console.error('Error occured during request (local)');
    console.error(`${error.config.method?.toUpperCase()} ${error.config.url}`);
    console.error('Axios request config: ', error.config);
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
