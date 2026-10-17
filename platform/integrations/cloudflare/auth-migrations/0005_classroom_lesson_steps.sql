CREATE TABLE IF NOT EXISTS platform_lesson_steps (
  step_id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL REFERENCES platform_class_entry(class_id),
  teacher_id TEXT NOT NULL,
  title TEXT NOT NULL,
  directions TEXT NOT NULL,
  resources_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('draft', 'released')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  released_at INTEGER
);

CREATE INDEX IF NOT EXISTS platform_lesson_steps_class_status_order
  ON platform_lesson_steps (class_id, status, sort_order, created_at);

