CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  company_address TEXT,
  detail_address TEXT,
  floor_room TEXT,
  map_lng REAL,
  map_lat REAL,
  map_address TEXT,
  legal_person_name TEXT,
  legal_person_id TEXT,
  legal_person_phone TEXT,
  contact_phone TEXT,
  business_clues TEXT,
  photo_names_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT '待初审',
  created_at TEXT NOT NULL,
  updates_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports (location);
CREATE INDEX IF NOT EXISTS idx_reports_map_point ON reports (map_lng, map_lat);
