import { GiftPurchase } from '@prisma/client';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { logger } from '../logger';
import prisma from '../ssr/prisma';
import { getGiftRedemptionUrl } from './gift/getGiftRedemptionUrl';

/**
 * Send an email out when someone purchases a gift
 *
 * @param customerEmail recipient email
 * @param giftId ID of the GiftPurchase
 * @param promoCodeCode Code of the promo code
 */
export const sendGiftPurchaseEmail = async (customerEmail: string, gifts: GiftPurchase[]) => {
    const auth = {
        auth: {
            api_key: process.env.NODEMAILER_API_KEY,
            domain: process.env.NODEMAILER_DOMAIN,
        },
    };

    let emailText = '';

    gifts = gifts.sort((a, b) => a.index - b.index);

    const price = await prisma.price.findUnique({
        where: {
            id: gifts[0].priceId,
        },
        include: {
            product: true,
        }
    });
    const intro = `
        <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<div class="container mx-auto" style="padding-left: 24px; padding-right: 24px">
        <h1 class="text-xl font-bold">PulseBanner Gift Purchase Receipt</h1><h3 class="text-base">Thank you for puchasing PulseBanner gifts! ❤️</h3>`;

    const bodyText = `<h2><a href="${process.env.NEXTAUTH_URL}/gifts/purchased?cs=${gifts[0].checkoutSessionId}">View Gift Purchase Summary</a></h2>`;

    let body = `<h2>${gifts.length}x ${price.nickname} ${price.product.name}</h2>`;

    body = body.concat(bodyText);

    let count = 1;
    for await (const gift of gifts) {
        const redemptionUrl = getGiftRedemptionUrl(gift.id);
        body = body.concat(`<h3>Gift #${count}:</h3>`)
        body = body.concat(`<p>Gift ID: ${gift.promoCodeCode}</p>`)
        const redemptionUrlHtml = `Redemption Link: <a href="${redemptionUrl}">${redemptionUrl}</a>`;
        body = body.concat(redemptionUrlHtml);
        body = body.concat('<br><br>');
        count++;
    }

    // const body = `See below for your one time use code to giveaway.<br><br><b>${gift.promoCodeCode}</b></></br>
    // You can also provide the winner with the following link which will take them right to checkout!<br><br><a href="url">${redemptionUrl}</a></br></br>
    const footer = `
        <h2><a href="${process.env.NEXTAUTH_URL}/gifts/purchased?cs=${gifts[0].checkoutSessionId}">View Gift Purchase Summary</a></h2>
        <br>Have any questions? Feel free to email us at contact@pulsebanner.com and we'll be sure to get back to you!
        <br><br>Thank you ❤️</br></br>
        <img width="256px" src="https://pb-static.sfo3.cdn.digitaloceanspaces.com/logos/tf_color_dark.png">
        </div>
        </body></html>`;

    emailText = intro + body + footer;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
        {
            sender: 'PulseBanner <no-reply@pulsebanner.com>',
            from: 'PulseBanner no-reply@pulsebanner.com',
            to: customerEmail, // An array if you have multiple recipients.
            subject: `PulseBanner Gift Purchase Receipt`,
            // You can use "html:" to send HTML email content. It's magic!
            html: `${emailText}`,
            //You can use "text:" to send plain-text content. It's oldschool!
            text: '',
        },
        (err, _info) => {
            if (err) {
                logger.error('Error gift code email.', { error: err, checkoutSessionId: gifts[0].checkoutSessionId, customerEmail });
            } else {
                console.log(
                    'Sent email'
                )
            }
        }
    );

    return emailText;
};
