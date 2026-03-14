PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events_ledger (
  operator_id     TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,  -- e.g. session.close
  occurred_at     TEXT NOT NULL,  -- ISO timestamp
  payload_json    TEXT NOT NULL,  -- full validated event payload
  created_at      TEXT NOT NULL,

  PRIMARY KEY (operator_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_operator_time
  ON events_ledger(operator_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_events_type
  ON events_ledger(event_type);