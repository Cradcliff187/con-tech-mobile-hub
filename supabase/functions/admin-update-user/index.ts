
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    console.log('Authenticated user:', user.id)
    
    // Use the regular authenticated client to check if current user is admin
    // This works because RLS policies allow users to see their own profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, is_company_user, account_status')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { profile, profileError })

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (profile.role !== 'admin' || !profile.is_company_user || profile.account_status !== 'approved') {
      console.error('Access denied for user:', user.id, 'Profile:', profile)
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log('Admin verification successful for user:', user.id)
    
    // Get service role key from environment or database
    let serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceRoleKey) {
      console.log('Service role key not found in environment, fetching from database...');
      const { data: settingData, error: settingError } = await supabaseClient
        .from('company_settings')
        .select('setting_value')
        .eq('setting_key', 'service_role_key')
        .single();
        
      if (settingError || !settingData) {
        console.error('Failed to fetch service role key from database:', settingError);
        return new Response(JSON.stringify({ error: 'Service role key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      // Extract string value from jsonb field
      if (typeof settingData.setting_value === 'string') {
        serviceRoleKey = settingData.setting_value;
      } else if (settingData.setting_value && typeof settingData.setting_value === 'object') {
        // If it's stored as jsonb, extract the actual string value
        serviceRoleKey = String(settingData.setting_value).replace(/^"|"$/g, '');
      } else {
        serviceRoleKey = String(settingData.setting_value);
      }
      
      console.log('Service role key extracted from database, length:', serviceRoleKey?.length);
    }
    
    // Create service role client for the actual update operation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    const { userId, updates } = await req.json()
    if (!userId || !updates) {
      return new Response(JSON.stringify({ error: 'userId and updates are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const allowedUpdates = ['role', 'account_status'];
    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(sanitizedUpdates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    console.log('Attempting to update user:', userId, 'with updates:', sanitizedUpdates)
    
    // Use service role client for the actual update (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(sanitizedUpdates)
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log('User updated successfully:', userId, sanitizedUpdates)
    return new Response(JSON.stringify({ message: 'User updated successfully' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
