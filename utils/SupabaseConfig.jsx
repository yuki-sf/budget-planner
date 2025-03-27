import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    'https://mkshvqbzmamtkijkklik.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2h2cWJ6bWFtdGtpamtrbGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzE0NjYsImV4cCI6MjA0OTUwNzQ2Nn0.OwTdVC-g-lKz1ZlY-11nlDt5CObKujY7DZFDt5HM2uM'
)
