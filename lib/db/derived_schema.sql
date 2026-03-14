-- Derived tables are rebuildable caches computed from the immutable events ledger.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS derived_session_index (
  operator_id         TEXT NOT NULL,
  session_id          TEXT NOT NULL,
  occurred_at         TEXT NOT NULL, -- session.close time ISO
  confirmed_class TEXT CHECK (confirmed_class IN ('narrative','emotional','behavioral','perceptual','continuity')),          -- nullable if not confirmed
  outcome TEXT NOT NULL CHECK (outcome IN ('reduced','unresolved','escalated')), -- reduced|unresolved|escalated
  clarity_rating      REAL NOT NULL, -- 0..10
  steps_completed     INTEGER NOT NULL, -- 0..9
  continuity_before   REAL,          -- nullable if no continuity.calculated
  continuity_after    REAL,          -- nullable if no continuity.calculated
  continuity_delta    REAL,          -- nullable if no continuity.calculated
  protocol_type       TEXT,          -- nullable if no protocol.selected
  formula_version     TEXT,          -- nullable if no continuity.calculated
  is_complete         INTEGER NOT NULL DEFAULT 0, -- 0/1
  updated_at          TEXT NOT NULL,

  PRIMARY KEY (operator_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_dsi_operator_time
  ON derived_session_index(operator_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_dsi_operator_class_time
  ON derived_session_index(operator_id, confirmed_class, occurred_at);


CREATE TABLE IF NOT EXISTS derived_recurrence_stats (
  operator_id      TEXT NOT NULL,
  class            TEXT NOT NULL,     -- narrative|emotional|behavioral|perceptual|continuity
  window_days      INTEGER NOT NULL,  -- 7|30|90
  count            INTEGER NOT NULL DEFAULT 0,
  last_seen_at     TEXT,              -- ISO
  avg_days_between REAL,              -- nullable
  updated_at       TEXT NOT NULL,

  PRIMARY KEY (operator_id, class, window_days)
);

CREATE INDEX IF NOT EXISTS idx_drs_operator_window
  ON derived_recurrence_stats(operator_id, window_days);


CREATE TABLE IF NOT EXISTS derived_recovery_stats (
  operator_id            TEXT NOT NULL,
  class                  TEXT NOT NULL,
  sample_size            INTEGER NOT NULL DEFAULT 0,
  reduced_rate           REAL NOT NULL DEFAULT 0, -- 0..1
  escalated_rate         REAL NOT NULL DEFAULT 0, -- 0..1
  avg_sessions_to_reduce REAL,                    -- nullable (optional V1)
  avg_clarity_delta      REAL,                    -- nullable
  updated_at             TEXT NOT NULL,

  PRIMARY KEY (operator_id, class)
);


CREATE TABLE IF NOT EXISTS derived_volatility (
  operator_id         TEXT NOT NULL,
  window_days         INTEGER NOT NULL, -- 30|90
  clarity_variance    REAL NOT NULL DEFAULT 0,
  continuity_variance REAL NOT NULL DEFAULT 0,
  volatility_band     TEXT NOT NULL DEFAULT 'low', -- low|medium|high
  updated_at          TEXT NOT NULL,

  PRIMARY KEY (operator_id, window_days)
);
