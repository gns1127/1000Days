// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { Database } from "@/types/supabase";

const supabaseUrl = VITE_SUPABASE_URL;      // 너의 프로젝트 URL
const supabaseKey = VITE_SUPABASE_ANON_KEY; // public API 키 (anon)

export const supabase = createClient(supabaseUrl, supabaseKey); // 클라이언트
