import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signOwnerToken, ownerCookieName } from "@/lib/auth";

export async function POST(request, { params }) {
  const { slug } = params;
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Enter the page's password." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: event } = await db
    .from("events")
    .select("id, owner_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "That page doesn't exist." }, { status: 404 });
  }

  const valid = await bcrypt.compare(String(password), event.owner_password_hash);
  if (!valid) {
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }

  const token = signOwnerToken(slug);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ownerCookieName(slug), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
