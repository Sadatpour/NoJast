import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { ad_id } = await req.json();
  const supabase = await createClient();

  // اطلاعات کاربر (در صورت لاگین)
  const { data: { user } } = await supabase.auth.getUser();

  // ثبت کلیک
  const { error } = await supabase.from("ad_clicks").insert({
    ad_id,
    user_id: user?.id || null,
    clicked_at: new Date().toISOString(),
    user_agent: req.headers.get("user-agent") || null,
    ip_address: req.headers.get("x-forwarded-for") || null,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 