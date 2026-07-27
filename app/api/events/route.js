import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signOwnerToken, ownerCookieName } from "@/lib/auth";

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(request) {
  const body = await request.json();
  const { title, eventType, eventDate, description, password } = body || {};

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Give the page a title." }, { status: 400 });
  }
  if (!password || String(password).length < 4) {
    return NextResponse.json(
      { error: "Choose a password with at least 4 characters." },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const base = slugify(title) || "page";
  let slug = base;
  let attempt = 0;

  // Try the clean slug first, then append a short random suffix on collision.
  while (attempt < 5) {
    const { data: existing } = await db
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const { data, error } = await db
    .from("events")
    .insert({
      slug,
      title: String(title).trim(),
      event_type: eventType || "other",
      event_date: eventDate || null,
      description: description || null,
      owner_password_hash: passwordHash,
      is_public: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create the page. Try again." }, { status: 500 });
  }

  const token = signOwnerToken(slug);
  const response = NextResponse.json({ slug: data.slug });
  response.cookies.set(ownerCookieName(slug), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
