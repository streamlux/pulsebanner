import { executeStreamDown } from "@app/features/executeFeatures";
import { createAuthApiHandler } from "@app/util/ssr/createApiHandler";

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        console.log(req.session);
        return res.send(401);
    }

    const userId = req.query.userId as string;
    if (userId) {
        await executeStreamDown(userId);
    } else {
        return res.status(400).send('Missing userId');
    }
});

export default handler;
