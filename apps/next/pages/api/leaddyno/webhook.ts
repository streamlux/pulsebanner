import { createApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createApiHandler();

handler.post(async (req, res) => {
    const body = req;
    console.log('body: ', body);
    res.status(200).send('Succes');
});
