
-- First, add the new enum values in a separate transaction
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'stakeholder';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vendor';
