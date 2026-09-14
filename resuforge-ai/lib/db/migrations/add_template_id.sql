-- Add template_id column to resumes table
-- Run this if you already have an existing database

ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'classic';

-- Update any NULL values to 'classic'
UPDATE resumes 
SET template_id = 'classic' 
WHERE template_id IS NULL;
