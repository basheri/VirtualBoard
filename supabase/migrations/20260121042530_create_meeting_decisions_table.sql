-- Create meeting_decisions table (GAP-007)
CREATE TABLE IF NOT EXISTS meeting_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    weights JSONB NOT NULL,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
    requires_human_input BOOLEAN NOT NULL DEFAULT FALSE,
    action_items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE meeting_decisions ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can view decisions for their projects"
    ON meeting_decisions FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert decisions for their projects"
    ON meeting_decisions FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_meeting_decisions_meeting_id ON meeting_decisions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_decisions_project_id ON meeting_decisions(project_id);

-- Add comment
COMMENT ON TABLE meeting_decisions IS 'Stores structured AI moderator decisions and action items from board meetings.';
