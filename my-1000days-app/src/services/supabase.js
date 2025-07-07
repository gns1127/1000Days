// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
//import { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;      // 너의 프로젝트 URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // public API 키 (anon)

console.log('환경변수:', import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);


export const supabase = createClient(supabaseUrl, supabaseKey); // 클라이언트
