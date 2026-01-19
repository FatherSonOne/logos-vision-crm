-- Create automation_logs table to track all automated task operations
-- This table stores execution history for monitoring and debugging automation workflows

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_type VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  result JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_automation_logs_type ON automation_logs(automation_type);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at DESC);
CREATE INDEX idx_automation_logs_success ON automation_logs(success);

-- Add comment for documentation
COMMENT ON TABLE automation_logs IS 'Stores execution history of automated task workflows including escalations, deadline adjustments, workload rebalancing, and digest generation';
COMMENT ON COLUMN automation_logs.automation_type IS 'Type of automation: daily_escalation, weekly_deadline_adjustment, weekly_workload_rebalancing, weekly_digest, etc.';
COMMENT ON COLUMN automation_logs.result IS 'JSON object containing execution results and statistics';
COMMENT ON COLUMN automation_logs.success IS 'Whether the automation completed successfully';
COMMENT ON COLUMN automation_logs.error_message IS 'Error details if the automation failed';
COMMENT ON COLUMN automation_logs.execution_time_ms IS 'Time taken to execute the automation in milliseconds';

-- Enable Row Level Security
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view automation logs
CREATE POLICY "Allow authenticated users to view automation logs"
  ON automation_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to insert logs
CREATE POLICY "Service role can insert automation logs"
  ON automation_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON automation_logs TO authenticated;
GRANT INSERT, UPDATE ON automation_logs TO service_role;
