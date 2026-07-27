import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyOwnerToken, ownerCookieName } from "@/lib/auth";

function isOwner(request, slug) {
  const token = request.cookies.get(ownerCookieName(slug))?.value;
  return verifyOwnerToken(slug, token);
}

export async function POST(request, { params }) {
  const { slug } = params;
  if (!isOwner(request, slug)) {
    return NextResponse.json({ error: "Log in as the owner to add photos." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: event } = await db.from("events").select("id").eq("slug", slug).maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "That page doesn't exist." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const note = formData.get("note") || "";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }
  if (!file.type || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "That file isn't an image." }, { status: 400 });
  }
  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Photos must be under 8MB." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${event.id}/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await db.storage
    .from("event-photos")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }

  const { data: photo, error: insertError } = await db
    .from("photos")
    .insert({ event_id: event.id, storage_path: storagePath, note: String(note).slice(0, 500) })
    .select()
    .single();

  if (insertError) {
    await db.storage.from("event-photos").remove([storagePath]);
    return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return NextResponse.json({
    photo: {
      id: photo.id,
      note: photo.note,
      uploadedAt: photo.uploaded_at,
      url: `${supabaseUrl}/storage/v1/object/public/event-photos/${photo.storage_path}`,
    },
  });
}
