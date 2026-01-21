const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const GUEST_UUID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const GUEST_EMAIL = 'guest@virtualboard.ai';

async function ensureGuestExists() {
    console.log('Checking for guest user in auth.users...');

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
    }

    const guestAuth = users?.find(u => u.id === GUEST_UUID);

    if (!guestAuth) {
        console.log('Guest user missing in auth.users, creating...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            id: GUEST_UUID,
            email: GUEST_EMAIL,
            email_confirm: true,
            user_metadata: { full_name: 'Guest User' }
        });

        if (createError) {
            console.error('Failed to create guest in auth.users:', createError);
        } else {
            console.log('Guest created in auth.users');
        }
    } else {
        console.log('Guest already exists in auth.users');
    }

    console.log('Ensuring profile exists...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: GUEST_UUID,
            email: GUEST_EMAIL,
            full_name: 'Guest User'
        });

    if (profileError) {
        console.error('Error ensuring profile:', profileError);
    } else {
        console.log('Profile ensured');
    }
}

ensureGuestExists();
