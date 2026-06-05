


CREATE TABLE public.exams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  company_logo TEXT,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  total_qns INTEGER NOT NULL,
  types_of_qns VARCHAR(100) NOT NULL,
  is_started BOOLEAN DEFAULT FALSE,
  show_login BOOLEAN DEFAULT FALSE
);


CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  candidate_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  college VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  year_of_study VARCHAR(50) NOT NULL,
  photo_url TEXT NOT NULL,
  registration_number VARCHAR(10),
  hall_ticket_number VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE public.sessions (
  id VARCHAR(50) PRIMARY KEY,
  student VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  exam VARCHAR(200) NOT NULL,
  flags_count INTEGER DEFAULT 0,
  integrity_score INTEGER DEFAULT 100,
  last_flag_type VARCHAR(100) DEFAULT 'None',
  severity VARCHAR(50) DEFAULT 'Normal',
  timestamp VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  live_feed TEXT
);
