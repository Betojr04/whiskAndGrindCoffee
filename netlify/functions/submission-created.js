// Sends an auto-reply email to the customer when a Netlify Form submission is created.
// Uses Gmail SMTP via nodemailer. Set env vars in Netlify: GMAIL_USER, GMAIL_PASS, AUTOREPLY_FROM, AUTOREPLY_SUBJECT.

const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    // Netlify sends the submission payload in event.body
    const payload = JSON.parse(event.body);
    const data =
      payload && payload.payload && payload.payload.data
        ? payload.payload.data
        : {};

    // Only fire if the form is our preorder form
    const formName = payload && payload.payload && payload.payload.form_name;
    if (formName !== "preorder") {
      return { statusCode: 200, body: "Ignored (not preorder form)" };
    }

    // Pull optional email
    const customerEmail = (data.email || "").trim();
    const igHandle = data.ig || "";
    const drink = data.drink || "";
    const day = data.day || "";
    const window = data.window || "";
    const milk = data.milk || "";
    const addon = data.addon || "";
    const notes = data.notes || "";

    // If no email was provided, skip autoresponder gracefully
    if (!customerEmail) {
      return {
        statusCode: 200,
        body: "No email provided; autoresponder skipped."
      };
    }

    // Transport via Gmail SMTP (App Password recommended)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const from = process.env.AUTOREPLY_FROM || process.env.GMAIL_USER;
    const subject =
      process.env.AUTOREPLY_SUBJECT || "We got your Whisk & Grind preorder 💚";

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#2b221b">
        <h2 style="margin:0 0 8px">Thanks for your preorder!</h2>
        <p style="margin:0 0 12px">We’ll confirm your pickup via <strong>Instagram DM</strong> (@whisk.grind.cafe) shortly.</p>
        <table style="border-collapse:collapse;background:#fff8f3;border:1px solid #efe4da;border-radius:12px;padding:12px">
          <tr><td style="padding:6px 8px"><strong>IG</strong></td><td style="padding:6px 8px">${
            igHandle || "-"
          }</td></tr>
          <tr><td style="padding:6px 8px"><strong>Drink</strong></td><td style="padding:6px 8px">${
            drink || "-"
          }</td></tr>
          <tr><td style="padding:6px 8px"><strong>Milk</strong></td><td style="padding:6px 8px">${
            milk || "-"
          }</td></tr>
          <tr><td style="padding:6px 8px"><strong>Add-on</strong></td><td style="padding:6px 8px">${
            addon || "-"
          }</td></tr>
          <tr><td style="padding:6px 8px"><strong>Pickup</strong></td><td style="padding:6px 8px">${
            day || "-"
          } ${window || ""}</td></tr>
          <tr><td style="padding:6px 8px"><strong>Notes</strong></td><td style="padding:6px 8px">${
            notes || "-"
          }</td></tr>
        </table>
        <p style="margin:12px 0 0;">If anything looks off, just reply to this email or DM us on Instagram.</p>
        <p style="margin:6px 0 0;">— Whisk &amp; Grind Cafe</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: customerEmail,
      subject,
      html
    });

    return { statusCode: 200, body: "Auto-reply sent." };
  } catch (err) {
    console.error("Auto-reply error:", err);
    return { statusCode: 500, body: "Error sending auto-reply." };
  }
};
