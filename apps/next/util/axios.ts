import axios from "axios";

export const twitchAxios = axios.create({
    baseURL: 'https://api.twitch.tv'
});

export const localAxios = axios.create({
    baseURL: process.env.NEXTAUTH_URL
});

export const remotionAxios = axios.create({
    baseURL: process.env.REMOTION_URL
})
