import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSupabaseSiteSettings() {
  console.log('Testing Supabase Cloud site_settings...');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', apiKey?.length);

  const res = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_site_settings&select=*`, {
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  const data = await res.json();
  console.log('Row status:', Array.isArray(data) && data.length > 0 ? 'Found global_site_settings' : 'Not found');
  if (Array.isArray(data) && data.length > 0) {
    console.log('Catalog Keys in site_settings:', Object.keys(data[0].catalog_data || {}));
    console.log('paymentSettings:', data[0].catalog_data?.paymentSettings);
  }
}

testSupabaseSiteSettings().catch(console.error);
