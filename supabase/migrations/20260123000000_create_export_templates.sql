-- Create export_templates table
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('pdf', 'excel', 'csv', 'png')),
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_export_templates_created_by ON export_templates(created_by);
CREATE INDEX idx_export_templates_template_type ON export_templates(template_type);
CREATE INDEX idx_export_templates_is_public ON export_templates(is_public);
CREATE INDEX idx_export_templates_usage_count ON export_templates(usage_count DESC);
CREATE INDEX idx_export_templates_created_at ON export_templates(created_at DESC);

-- Create GIN index for JSONB configuration
CREATE INDEX idx_export_templates_configuration ON export_templates USING GIN (configuration);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_export_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_export_templates_updated_at
  BEFORE UPDATE ON export_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_export_templates_updated_at();

-- Enable Row Level Security
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON export_templates
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can view public templates
CREATE POLICY "Users can view public templates"
  ON export_templates
  FOR SELECT
  USING (is_public = true);

-- Policy: Users can view templates shared with them
CREATE POLICY "Users can view shared templates"
  ON export_templates
  FOR SELECT
  USING (auth.uid()::TEXT = ANY(shared_with));

-- Policy: Users can create their own templates
CREATE POLICY "Users can create templates"
  ON export_templates
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON export_templates
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON export_templates
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE export_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;

-- Create function to get template statistics
CREATE OR REPLACE FUNCTION get_template_stats(user_id UUID)
RETURNS TABLE(
  total_templates BIGINT,
  public_templates BIGINT,
  private_templates BIGINT,
  total_usage BIGINT,
  most_used_template_id UUID,
  most_used_template_name TEXT,
  most_used_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_public = true) as public_count,
      COUNT(*) FILTER (WHERE is_public = false) as private_count,
      COALESCE(SUM(usage_count), 0) as total_usage_count
    FROM export_templates
    WHERE created_by = user_id
  ),
  most_used AS (
    SELECT id, name, usage_count
    FROM export_templates
    WHERE created_by = user_id
    ORDER BY usage_count DESC
    LIMIT 1
  )
  SELECT
    stats.total,
    stats.public_count,
    stats.private_count,
    stats.total_usage_count,
    most_used.id,
    most_used.name,
    most_used.usage_count
  FROM stats
  LEFT JOIN most_used ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the stats function
GRANT EXECUTE ON FUNCTION get_template_stats(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE export_templates IS 'Stores export configuration templates for reports';
COMMENT ON COLUMN export_templates.configuration IS 'JSONB object containing format-specific export settings';
COMMENT ON COLUMN export_templates.shared_with IS 'Array of user IDs who have access to this template';
COMMENT ON COLUMN export_templates.usage_count IS 'Number of times this template has been used';
