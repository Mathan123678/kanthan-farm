CREATE TABLE IF NOT EXISTS birds (
  bird_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT,
  weight NUMERIC,
  age INTEGER,
  color TEXT,
  health_status TEXT,
  match_ready BOOLEAN DEFAULT FALSE,
  buy_price NUMERIC,
  buy_date DATE,
  seller TEXT,
  location TEXT,
  status TEXT,
  photo TEXT
);

CREATE TABLE IF NOT EXISTS sales (
  sale_id SERIAL PRIMARY KEY,
  bird_id INTEGER REFERENCES birds(bird_id) ON DELETE SET NULL,
  buyer_name TEXT,
  buyer_state TEXT,
  selling_price NUMERIC,
  selling_date DATE,
  transport_cost NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  expense_id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS health_records (
  health_id SERIAL PRIMARY KEY,
  bird_id INTEGER REFERENCES birds(bird_id) ON DELETE CASCADE,
  vaccination_date DATE,
  medicine TEXT,
  doctor TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  match_id SERIAL PRIMARY KEY,
  bird_id INTEGER REFERENCES birds(bird_id) ON DELETE CASCADE,
  match_date DATE,
  opponent TEXT,
  result TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS buyers (
  buyer_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  total_purchases NUMERIC DEFAULT 0
);

