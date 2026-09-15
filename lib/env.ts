/**
 * Supabase connection.
 *
 * The values below are the fallback so the app works straight after a GitHub
 * import, with no environment variables set in Vercel. The anon key is a public
 * key by design. Row Level Security in the database is what protects the data.
 *
 * If you set the environment variables in Vercel they win.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ybpwiqcosuzjwvdmspgt.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicHdpcWNvc3V6and2ZG1zcGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzQwMDUsImV4cCI6MjEwNDkxMDAwNX0.ULoTXoDXqBCDPAE8ICfWHgtNx9QKxPR8WqDzzK-I7nU";
