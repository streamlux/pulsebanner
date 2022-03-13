import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { logger } from '../logger';

// we send an email out when someone purchases a gift
export const sendCouponCodeToCustomerEmail = (customerEmail: string, promoCode: string) => {
    console.log('seindg coupon Code method');
    const auth = {
        auth: {
            api_key: process.env.NODEMAILER_API_KEY,
            domain: process.env.NODEMAILER_DOMAIN,
        },
    };

    const checkoutUrl = `https://pulsebanner.com/redeem?promoCode=${promoCode}`;

    const emailText = `Thank you for puchasing a PulseBanner gift!
    See below for your one time use code to giveaway.<br><br><b>${promoCode}</b></br></br>
    You can also provide the winner with the following link which will take them right to checkout!<br><br><a>${checkoutUrl}</a></br></br>
    Have any questions? Feel free to email us at contact@pulsebanner.com and we'll be sure to get back to you!
    <br><br>Thank you ❤️</br></br>
    PulseBanner Team`;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
        {
            from: 'no-reply@pulsebanner.com',
            to: `andrewespn@hotmail.com`, // An array if you have multiple recipients.
            subject: 'Thank you from PulseBanner: Gift Purchased!',
            // You can use "html:" to send HTML email content. It's magic!
            html: `${emailText}`,
            //You can use "text:" to send plain-text content. It's oldschool!
            text: '',
        },
        (err, _info) => {
            if (err) {
                logger.error('Error forwarding gift code and link to user email.', { error: err });
            }
        }
    );
};
