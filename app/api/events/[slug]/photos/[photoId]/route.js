import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyOwnerToken, ownerCookieName } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const { slug, photoId } = params;
  const token = request.cookies.get(ownerCookieName(slug))?.value;
  if (!verifyOwnerToken(slug, token)) {
    return NextResponse.json({ error: "Log in as the owner to delete photos." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: photo } = await db
    .from("photos")
    .select("id, storage_path")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "That photo is already gone." }, { status: 404 });
  }

  await db.storage.from("event-photos").remove([photo.storage_path]);
  await db.from("photos").delete().eq("id", photoId);

  return NextResponse.json({ ok: true });
}
