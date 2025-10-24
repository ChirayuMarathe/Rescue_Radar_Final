import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uepbrpqwyrbwphkasbsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcGJycHF3eXJid3Boa2FzYnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA0NjksImV4cCI6MjA2ODA3NjQ2OX0.ywp2XrB4ACOh_XbrPOXiIPjnFfO4G-Hj8R3h_o4hB1o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

try {
  // ...your Supabase insert code...
} catch (error) {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Unknown error');
}
