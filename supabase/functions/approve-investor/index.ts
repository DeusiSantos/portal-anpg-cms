import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated and has investor manager permissions
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: callerUser }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const callerUserId = callerUser.id;

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check caller has investor management permission
    const { data: hasPermission } = await supabaseAdmin.rpc('can_manage_investors', { _user_id: callerUserId });
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { registrationId, action, rejectionReason } = await req.json();

    if (!registrationId || !action) {
      return new Response(JSON.stringify({ error: 'Missing registrationId or action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch registration
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('investor_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (registration.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Registration already processed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'reject') {
      // Update status to rejected
      await supabaseAdmin
        .from('investor_registrations')
        .update({
          status: 'rejected',
          reviewed_by: callerUserId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq('id', registrationId);

      return new Response(JSON.stringify({ success: true, action: 'rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'approve') {
      // Generate a temporary password
      const tempPassword = generatePassword(14);

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: registration.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: registration.full_name,
          company_name: registration.company_name,
          is_investor: true,
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Create profile
      await supabaseAdmin.from('profiles').insert({
        user_id: authData.user.id,
        full_name: registration.full_name,
        email: registration.email,
        department: 'investimentos',
      });

      // Assign investor role
      await supabaseAdmin.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'investor',
      });

      // Update registration status
      await supabaseAdmin
        .from('investor_registrations')
        .update({
          status: 'approved',
          reviewed_by: callerUserId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      // Send welcome email via Supabase Auth
      // We use the built-in invite to trigger an email
      // But since user is already created, we'll use a custom approach
      // For now, return the temp password so admin can share it
      // In production, integrate with an email service

      console.log(`Investor approved: ${registration.email}`);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'approved',
          credentials: {
            email: registration.email,
            temporaryPassword: tempPassword,
          },
          message: 'Investor account created. Share the credentials securely.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
