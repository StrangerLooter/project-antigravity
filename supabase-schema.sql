-- Supabase Schema for CivicAI

-- 1. Create the grievances table
CREATE TABLE public.grievances (
  id text PRIMARY KEY,
  "citizenName" text NOT NULL,
  phone text NOT NULL,
  email text,
  "inputMode" text DEFAULT 'text',
  "imageName" text,
  "imageDataUrl" text,
  "rawText" text NOT NULL,
  summary text NOT NULL,
  department text NOT NULL,
  category text NOT NULL,
  urgency text NOT NULL,
  status text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  score integer NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  officer text NOT NULL,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- 2. Setup row level security (RLS)
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow insert from public (for citizens submitting)
CREATE POLICY "Allow public insert" ON public.grievances 
  FOR INSERT WITH CHECK (true);

-- Allow select from public (for tracking portal and dashboards)
CREATE POLICY "Allow public select" ON public.grievances 
  FOR SELECT USING (true);

-- Allow updates (for officers advancing status)
CREATE POLICY "Allow public update" ON public.grievances 
  FOR UPDATE USING (true);
