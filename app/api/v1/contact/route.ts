import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactFormSchema.parse(body);

    await sendEmail({
      to: "admin@contentflow.io",
      subject: `[Contact Form] ${validated.subject} from ${validated.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>New Message from ${validated.name} (${validated.email})</h3>
          <p><strong>Subject:</strong> ${validated.subject}</p>
          <div style="margin-top: 16px; padding: 12px; background-color: #f1f5f9; border-radius: 6px;">
            ${validated.message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
