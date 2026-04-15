-- 待购提醒表
CREATE TABLE IF NOT EXISTS shopping_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(100) NOT NULL,
  message VARCHAR(300),
  created_by UUID NOT NULL,
  claimer_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT shopping_notes_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT shopping_notes_claimer_id_fkey
    FOREIGN KEY (claimer_id) REFERENCES members(id) ON DELETE SET NULL,
  CONSTRAINT shopping_notes_status_check
    CHECK (status IN ('open', 'claimed', 'done'))
);

CREATE INDEX IF NOT EXISTS idx_shopping_notes_status ON shopping_notes(status);
CREATE INDEX IF NOT EXISTS idx_shopping_notes_created_at ON shopping_notes(created_at DESC);

CREATE OR REPLACE TRIGGER shopping_notes_updated_at
  BEFORE UPDATE ON shopping_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
