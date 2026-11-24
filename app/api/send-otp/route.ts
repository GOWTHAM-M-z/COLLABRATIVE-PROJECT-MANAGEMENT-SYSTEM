import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    // Requires EMAIL_USER and EMAIL_PASS in .env.local
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "TeamMerge Pro - Your Verification Code",
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md mx-auto p-6 bg-gray-50 border rounded-lg">
          <h2 style="color: #333; text-align: center;">TeamMerge Pro</h2>
          <p style="color: #555; text-align: center;">Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email. Check console or credentials." }, { status: 500 });
  }
}
