export function checkValidDownload(base64: string) {
    // https://stackoverflow.com/a/58158656/10237052
    return base64.startsWith('/9j/') || base64.startsWith('iVBORw0KGgo') || base64 === 'empty';
}
