import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nbvlkmynwtsepuogwusx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idmxrbXlud3RzZXB1b2d3dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzgzMzMsImV4cCI6MjA4ODUxNDMzM30.R0FxCUsQKMN13WHxKdAqgOfkZK4gjeAjp8VyKxTrcDc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);