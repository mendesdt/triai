export const environment = {
  production: false,
  supabase: {
    url: process.env['VITE_SUPABASE_URL'] || '',
    anonKey: process.env['VITE_SUPABASE_ANON_KEY'] || ''
  }
};