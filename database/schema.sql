CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  long_description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '18:00',
  location TEXT NOT NULL,
  venue_address TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  capacity INTEGER NOT NULL DEFAULT 100,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  badge TEXT DEFAULT 'New Event',
  color TEXT DEFAULT '#7c3aed',
  accent TEXT DEFAULT '#3b82f6',
  organizer TEXT DEFAULT 'Ease Events',
  seat_layout JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time TEXT DEFAULT '18:00';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'New Event';
ALTER TABLE events ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#7c3aed';
ALTER TABLE events ADD COLUMN IF NOT EXISTS accent TEXT DEFAULT '#3b82f6';
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer TEXT DEFAULT 'Ease Events';
ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_layout JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  ticket_count INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2),
  payment_id TEXT,
  order_id TEXT,
  payment_status TEXT DEFAULT 'paid',
  booking_status TEXT DEFAULT 'confirmed',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
  seat_identifier TEXT NOT NULL,
  section_id TEXT,
  row_label TEXT,
  col_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, seat_identifier)
);

INSERT INTO categories (name)
VALUES
  ('Music'),
  ('Cultural'),
  ('Technology'),
  ('Classical Dance'),
  ('Sports'),
  ('Food & Cuisine'),
  ('General')
ON CONFLICT (name) DO NOTHING;
