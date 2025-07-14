const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    // Additional security and reliability settings
    secure: true,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"Family Social Site" <${process.env.GMAIL_USER}>`, // Proper sender format
    to: options.email,
    subject: options.subject,
    html: options.html,
    // Add text version for better deliverability
    text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version

    // Important headers to improve deliverability
    headers: {
      "X-Priority": "3", // Normal priority (1=High, 3=Normal, 5=Low)
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
      "X-Mailer": "Family Social Site v1.0",
      "Reply-To": process.env.GMAIL_USER,
      "Return-Path": process.env.GMAIL_USER,
      "List-Unsubscribe": `<mailto:${process.env.GMAIL_USER}?subject=Unsubscribe>`,
      "Message-ID": `<${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@familysocialsite.com>`,
    },

    // Set encoding
    encoding: "utf8",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
