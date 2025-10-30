import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ussyjysucidmckmxvlee.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc3lqeXN1Y2lkbWNrbXh2bGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjI3MzcsImV4cCI6MjA3NDgzODczN30.KVkTcHjk-DFAF5_RtQsGY9VvRAkPshucxFnh0ihQi9g";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
