require("dotenv").config(); // Load environment variables

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Use SendGrid API key from .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendWelcomeEmail = onDocumentCreated("waitlist/{docId}", async (event) => {
  const snap = event.data;
  const newSignup = snap.data();
  const userEmail = newSignup.email;

  if (!userEmail) {
    console.log("No email found in document!");
    return null;
  }

  const msg = {
    to: userEmail,
    from: "hello@thesocialatlas.com", // Your sender email
    subject: "Welcome to Social Atlas 🌎",
    text: "Thank you for joining Social Atlas! You're officially part of the adventure. We'll be in touch soon with exciting updates!",
    html: `
      <div style="background-color: #fdfbf5; padding: 40px 20px; min-height: 100vh;">
        <div style="background-color: #1b1b1b; padding: 40px 20px; border-radius: 16px; max-width: 500px; margin: auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
          <img src="https://i.ibb.co/84BY28cH/earthy-icon.png" alt="Social Atlas" style="width: 120px; margin-bottom: 20px;" />
          <h1 style="font-size: 28px; margin-bottom: 16px;">Welcome to Social Atlas!</h1>
          <p style="font-size: 16px; margin-bottom: 24px;">Thanks for joining our global travel and creator community. You're officially part of the adventure!</p>
          <a href="https://instagram.com/socialatlas_app" style="display: inline-block; background-color: #1d5136; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold;">Follow us on Instagram</a>
          <p style="font-size: 14px; color: #cccccc; margin-top: 30px;">We’ll be in touch soon with exciting updates.<br />– The Social Atlas Team</p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }

  return null;
});
