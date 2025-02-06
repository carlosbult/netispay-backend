// import { Injectable } from '@nestjs/common';
// import { createTransport, type Transporter } from 'nodemailer';
// import { SMTP_GMAIL_USERNAME, SMTP_GMAIL_PASSWORD } from '../../config';

// @Injectable()
// export class MailService {
//   private readonly transporter: Transporter;

//   constructor() {
//     this.transporter = createTransport({
//       service: 'gmail',
//       auth: {
//         user: SMTP_GMAIL_USERNAME,
//         pass: SMTP_GMAIL_PASSWORD,
//       },
//     });
//   }

//   async sendMail(to: string, subject: string, message: string): Promise<void> {
//     const mailOptions = {
//       from: SMTP_GMAIL_USERNAME,
//       to,
//       subject,
//       text: message,
//     };

//     await this.transporter.sendMail(mailOptions);
//   }
// }
