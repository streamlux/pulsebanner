import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

// we send an email out when someone purchases a gift
export const sendCouponCodeToCustomerEmail = (customerEmail: string, couponCode: string) => {
    const auth = {
        auth: {
            api_key: process.env.NODEMAILER_API_KEY,
            domain: process.env.NODEMAILER_DOMAIN,
        },
    };

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
      from: 'contact@pulsebanner.com',
      to: '', // An array if you have multiple recipients.
      cc:'second@domain.com',
      bcc:'secretagent@company.gov',
      subject: 'Thanks',
      'h:Reply-To': 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: '<b>Wow Big powerful letters</b>',
      //You can use "text:" to send plain-text content. It's oldschool!
      text: 'Mailgun rocks, pow pow!'
    }, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
      }
      else {
        console.log(`Response: ${info}`);
      }
    });
};
