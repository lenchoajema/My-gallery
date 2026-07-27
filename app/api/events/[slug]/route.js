import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyOwnerToken, ownerCookieName } from "@/lib/auth";

function isOwner(request, slug) {
  const token = request.cookies.get(ownerCookieName(slug))?.value;
  return verifyOwnerToken(slug, token);
}

export async function GET(request, { params }) {
  const { slug } = params;
  const db = supabaseAdmin();

  const { data: event, error } = await db
    .from("events")
    .select("id, slug, title, event_type, event_date, description, is_public, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) {
    return NextResponse.json({ error: "That page doesn't exist." }, { status: 404 });
  }

  const owner = isOwner(request, slug);

  if (!event.is_public && !owner) {
    return NextResponse.json(
      { error: "This page is private.", private: true },
      { status: 403 }
    );
  }

  const { data: photos } = await db
    .from("photos")
    .select("id, storage_path, note, uploaded_at")
    .eq("event_id", event.id)
    .order("uploaded_at", { ascending: false });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const photosWithUrls = (photos || []).map((p) => ({
    id: p.id,
    note: p.note,
    uploadedAt: p.uploaded_at,
    url: `${supabaseUrl}/storage/v1/object/public/event-photos/${p.storage_path}`,
  }));

  return NextResponse.json({ event, photos: photosWithUrls, isOwner: owner });
}

export async function PATCH(request, { params }) {
  const { slug } = params;
  if (!isOwner(request, slug)) {
    return NextResponse.json({ error: "Log in as the owner to edit this page." }, { status: 401 });
  }

  const body = await request.json();
  const updates = {};
  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.eventDate === "string") updates.event_date = body.eventDate || null;
  if (typeof body.eventType === "string") updates.event_type = body.eventType;
  if (typeof body.isPublic === "boolean") updates.is_public = body.isPublic;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("events")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }
  return NextResponse.json({ event: data });
}

export async function DELETE(request, { params }) {
  const { slug } = params;
  if (!isOwner(request, slug)) {
    return NextResponse.json({ error: "Log in as the owner to delete this page." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: event } = await db.from("events").select("id").eq("slug", slug).maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "That page doesn't exist." }, { status: 404 });
  }

  const { data: photos } = await db.from("photos").select("storage_path").eq("event_id", event.id);
  if (photos && photos.length) {
    await db.storage.from("event-photos").remove(photos.map((p) => p.storage_path));
  }

  await db.from("events").delete().eq("slug", slug);
  return NextResponse.json({ ok: true });
}
