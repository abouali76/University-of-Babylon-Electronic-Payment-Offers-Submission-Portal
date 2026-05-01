import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const usernameToEmail = (username: string) =>
  `${String(username || "").trim().toLowerCase()}@uob.local`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing server env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "create";
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || username).trim();

    if (!username) {
      return new Response(JSON.stringify({ error: "username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = usernameToEmail(username);

    if (action === "delete") {
      // 1. Find user ID from auth
      let targetUserId = null;
      const { data: list } = await adminClient.auth.admin.listUsers();
      const u = list?.users?.find((user) => user.email === email);
      if (u) {
        targetUserId = u.id;
      }

      if (targetUserId) {
        const { error: delError } = await adminClient.auth.admin.deleteUser(targetUserId);
        if (delError) throw delError;
      }
      
      // Cascade delete should handle profiles and submissions, but we can be explicit
      await adminClient.from("profiles").delete().eq("username", username);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE ACTION
    if (!password) {
      return new Response(JSON.stringify({ error: "password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, display_name: displayName, role: "company" },
      app_metadata: { role: "company" },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = created.user?.id;
    if (!userId) throw new Error("User created but missing ID");

    // Sync to profiles
    const { error: profileError } = await adminClient.from("profiles").upsert({
      user_id: userId,
      username,
      display_name: displayName,
      role: "company",
    });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ ok: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
