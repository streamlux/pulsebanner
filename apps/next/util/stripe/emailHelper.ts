import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { logger } from '../logger';

/**
 * Send an email out when someone purchases a gift
 *
 * @param customerEmail recipient email
 * @param promoCode discount code text
 */
export const sendCouponCodeToCustomerEmail = (customerEmail: string, promoCode: string) => {
    const auth = {
        auth: {
            api_key: process.env.NODEMAILER_API_KEY,
            domain: process.env.NODEMAILER_DOMAIN,
        },
    };

    const checkoutUrl = `${process.env.NEXTAUTH_URL}/redeem?code=${promoCode}`;

    const emailText = `Thank you for puchasing a PulseBanner gift!
    See below for your one time use code to giveaway.<br><br><b>${promoCode}</b></br></br>
    You can also provide the winner with the following link which will take them right to checkout!<br><br><a href="url">${checkoutUrl}</a></br></br>
    Have any questions? Feel free to email us at contact@pulsebanner.com and we'll be sure to get back to you!
    <br><br>Thank you ❤️</br></br>
    PulseBanner Team`;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
        {
            from: 'no-reply@pulsebanner.com',
            to: customerEmail, // An array if you have multiple recipients.
            subject: 'PulseBanner Membership Gift Code',
            // You can use "html:" to send HTML email content. It's magic!
            html: `${emailText}`,
            //You can use "text:" to send plain-text content. It's oldschool!
            text: '',
        },
        (err, _info) => {
            if (err) {
                logger.error('Error gift code email.', { error: err, promoCode, customerEmail });
            }
        }
    );
};
