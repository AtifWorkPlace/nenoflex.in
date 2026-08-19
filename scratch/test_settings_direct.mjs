import { SupabaseServerService } from './src/lib/supabase-server';

async function testSettings() {
  console.log('Testing SupabaseServerService.fetchSettings()...');
  const settings = await SupabaseServerService.fetchSettings();
  console.log('Fetched settings:', settings ? Object.keys(settings) : 'null');
  console.log('paymentSettings in DB:', settings?.paymentSettings);
}

testSettings().catch(console.error);
