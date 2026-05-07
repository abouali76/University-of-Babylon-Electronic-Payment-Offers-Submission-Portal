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

    if (action === "admin_login") {
      const adminPasswordInput = String(body.password || "");
      if (!adminPasswordInput) {
        return new Response(JSON.stringify({ error: "password required" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: adminRow, error: adminRowError } = await adminClient
        .from("users")
        .select("password")
        .eq("username", "admin")
        .maybeSingle();
      if (adminRowError) throw adminRowError;

      const savedAdminPass = String(adminRow?.password || "admin123");
      const isValid = adminPasswordInput === savedAdminPass;

      return new Response(JSON.stringify({ success: isValid }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "change_admin_password") {
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");

      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({ error: "currentPassword and newPassword required" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: adminRow, error: adminRowError } = await adminClient
        .from("users")
        .select("password")
        .eq("username", "admin")
        .maybeSingle();
      if (adminRowError) throw adminRowError;

      const savedAdminPass = String(adminRow?.password || "admin123");
      // Optional check for current password - we can bypass this if it's the admin calling from the panel
      if (currentPassword && currentPassword !== savedAdminPass) {
        return new Response(JSON.stringify({ error: "current password is invalid" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: upsertError } = await adminClient.from("users").upsert({
        username: "admin",
        name: "Admin",
        password: newPassword,
        role: "admin",
      });
      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!username) {
      return new Response(JSON.stringify({ error: "username required" }), {
        status: 200,
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

      // 2. Delete files from storage if user found
      if (targetUserId) {
        try {
          // List all files in the user's folder in 'documents' bucket
          const { data: files, error: listError } = await adminClient.storage
            .from("documents")
            .list(targetUserId);
          
          if (files && files.length > 0) {
            const paths = files.map(f => `${targetUserId}/${f.name}`);
            await adminClient.storage.from("documents").remove(paths);
            console.log(`Deleted ${files.length} files for user ${targetUserId}`);
          }
        } catch (e) {
          console.error("Storage cleanup failed:", e);
        }

        // 3. Delete auth user
        const { error: delError } = await adminClient.auth.admin.deleteUser(targetUserId);
        if (delError) throw delError;
      }
      
      // 4. Delete database records explicitly
      // Cascade delete should handle submissions if FK is set, but we be explicit for safety
      await adminClient.from("submissions").delete().eq("username", username);
      await adminClient.from("users").delete().eq("username", username);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset") {
      const { error } = await adminClient.from("submissions").delete().eq("username", username);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "confirm_receipt") {
      const { error } = await adminClient.from("submissions").update({ is_received: true }).eq("username", username);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "finalize") {
      const { error } = await adminClient.from("submissions").update({ status: "final", is_received: true, last_updated: new Date().toISOString() }).eq("username", username);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_score") {
      const score = body.score;
      const { error } = await adminClient.from("submissions").update({ evaluation_score: score }).eq("username", username);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CREATE ACTION
    if (!password) {
      return new Response(JSON.stringify({ error: "password required" }), {
        status: 200,
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
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = created.user?.id;
    if (!userId) throw new Error("User created but missing ID");

    // Sync to users table (which AdminPanel uses to list companies)
    const { error: usersError } = await adminClient.from("users").upsert({
      username,
      name: displayName,
      password: password, // For manual logins
      role: "company",
    });

    if (usersError) console.error("Failed to sync to users table:", usersError);

    return new Response(JSON.stringify({ ok: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
