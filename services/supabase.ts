
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to hardcoded values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ydkicdhcylpdffuzgdvm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_E_rpgEr5_Vf1_1wkLBGKNQ_hxvfdeED';

// Create a singleton client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
