import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import prisma from '../../../util/ssr/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET'],
        origin: 'https://pulsebanner.com',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const products = await prisma.product.findMany({
        where: {
            active: true,
        },
        include: {
            prices: {
                where: {
                    active: true,
                },
            },
        },
    });

    res.status(200).send(products);
}
