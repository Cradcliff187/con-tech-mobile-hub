-- Clean up orphaned auth user to allow fresh signup testing
-- This user exists in auth.users but not in profiles, preventing proper testing
DELETE FROM auth.users WHERE email = 'chris.l.radcliff@gmail.com';