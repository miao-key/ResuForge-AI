-- 添加 template_id 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'resumes' 
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE resumes 
    ADD COLUMN template_id VARCHAR(50) DEFAULT 'classic';
    
    -- 为现有记录设置默认值
    UPDATE resumes SET template_id = 'classic' WHERE template_id IS NULL;
    
    RAISE NOTICE 'Added template_id column to resumes table';
  ELSE
    RAISE NOTICE 'template_id column already exists';
  END IF;
END $$;
