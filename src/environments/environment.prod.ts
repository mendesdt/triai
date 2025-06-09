export const environment = {
  production: true,
  supabase: {
    url: process.env['VITE_SUPABASE_URL'] || '',
    anonKey: process.env['VITE_SUPABASE_ANON_KEY'] || ''
  }
};