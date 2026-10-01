"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { credentials, otpSchema, resetSchema, signupSchema } from "@/lib/validation/auth";
import { sendOtpEmail } from "@/lib/mail";
import { createClient } from "@supabase/supabase-js";

const back = (path: string, error: string) => redirect(`${path}?error=${encodeURIComponent(error)}`);

// Initialize the admin client to generate manual OTPs
const adminAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
).auth.admin;

export async function signIn(fd: FormData) {
  const p = credentials.safeParse(Object.fromEntries(fd));
  if (!p.success) return back("/login", p.error.issues[0].message);
  const { error } = await (await supabaseServer()).auth.signInWithPassword(p.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      // Generate OTP and send manually
      const { data } = await adminAuth.generateLink({ type: "signup", email: p.data.email, password: p.data.password });
      if (data?.properties?.email_otp) {
        await sendOtpEmail(p.data.email, data.properties.email_otp, "signup");
      }
      redirect(`/verify?email=${encodeURIComponent(p.data.email)}`);
    }
    return back("/login", "Email or password is incorrect.");
  }
  redirect("/");
}

export async function signUp(fd: FormData) {
  const p = signupSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return back("/signup", p.error.issues[0].message);
  
  // Create user using the admin API to get the manual OTP
  const { data, error } = await adminAuth.generateLink({
    type: "signup",
    email: p.data.email,
    password: p.data.password,
    options: { data: { full_name: p.data.name } },
  });
  
  if (error) return back("/signup", error.message);
  
  if (data?.properties?.email_otp) {
    // Send email with nodemailer completely bypassing Supabase's built-in mailer
    await sendOtpEmail(p.data.email, data.properties.email_otp, "signup");
    redirect(`/verify?email=${encodeURIComponent(p.data.email)}`);
  }
  
  // If confirm email was turned off in settings, generateLink might not return an OTP
  redirect("/profile/setup");
}

export async function signOut() {
  await (await supabaseServer()).auth.signOut();
  redirect("/login");
}

export async function requestReset(fd: FormData) {
  const p = credentials.pick({ email: true }).safeParse(Object.fromEntries(fd));
  if (!p.success) return back("/forgot-password", p.error.issues[0].message);
  
  const { data, error } = await adminAuth.generateLink({ type: "recovery", email: p.data.email });
  if (error) return back("/forgot-password", "Could not send the code. Wait a minute and try again.");
  
  if (data?.properties?.email_otp) {
    await sendOtpEmail(p.data.email, data.properties.email_otp, "reset");
  }
  
  redirect(`/reset?email=${encodeURIComponent(p.data.email)}`);
}

export async function verifyEmail(fd: FormData) {
  const p = otpSchema.safeParse(Object.fromEntries(fd));
  const email = String(fd.get("email") ?? "");
  const to = `/verify?email=${encodeURIComponent(email)}`;
  if (!p.success) return back(to, p.error.issues[0].message);
  const { error } = await (await supabaseServer()).auth.verifyOtp({ email: p.data.email, token: p.data.code, type: "signup" });
  if (error) return back(to, "That code is wrong or has expired. Request a new one.");
  redirect("/profile/setup");
}

export async function resendCode(fd: FormData) {
  const email = String(fd.get("email") ?? "");
  const to = `/verify?email=${encodeURIComponent(email)}`;
  const p = credentials.pick({ email: true }).safeParse({ email });
  if (!p.success) return back("/signup", "Enter your email to get a code.");
  
  const { data, error } = await adminAuth.generateLink({ type: "signup", email: p.data.email } as any);
  if (error) return back(to, "Could not resend yet. Wait a minute and try again.");
  
  if (data?.properties?.email_otp) {
    await sendOtpEmail(p.data.email, data.properties.email_otp, "signup");
  }
  
  redirect(`${to}&sent=1`);
}

export async function resetWithCode(fd: FormData) {
  const p = resetSchema.safeParse(Object.fromEntries(fd));
  const email = String(fd.get("email") ?? "");
  const to = `/reset?email=${encodeURIComponent(email)}`;
  if (!p.success) return back(to, p.error.issues[0].message);
  const sb = await supabaseServer();
  const v = await sb.auth.verifyOtp({ email: p.data.email, token: p.data.code, type: "recovery" });
  if (v.error) return back(to, "That code is wrong or has expired. Request a new one.");
  const u = await sb.auth.updateUser({ password: p.data.password });
  if (u.error) return back(to, u.error.message);
  redirect("/");
}
