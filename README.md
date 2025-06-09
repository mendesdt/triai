# Healthcare Triage App

A modern healthcare triage application built with Angular 19 and Supabase.

## Features

- **Role-based Authentication**: Different interfaces for doctors, nurses, administrators, and reception staff
- **Patient Queue Management**: Real-time patient queue with status tracking
- **Triage System**: Comprehensive triage forms with vital signs and symptom tracking
- **Patient History**: Complete medical history and analysis
- **AI-powered Insights**: Clinical alerts and pattern recognition
- **Admin Dashboard**: System monitoring and user management

## Tech Stack

- **Frontend**: Angular 19
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Custom CSS with Material Icons
- **State Management**: RxJS Observables

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update the environment files with your Supabase credentials:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### 2. Database Schema

Create the following tables in your Supabase database:

```sql
-- Pending patients table
CREATE TABLE pending_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  entry_date DATE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-triage', 'triaged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  arrival_time TEXT,
  priority TEXT DEFAULT 'Não triado',
  symptoms TEXT[],
  other_symptoms TEXT,
  duration TEXT,
  intensity TEXT,
  medications TEXT,
  status TEXT DEFAULT 'active',
  completed_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triages table
CREATE TABLE triages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  mother_name TEXT,
  consult_reason TEXT,
  symptoms TEXT[],
  other_symptoms TEXT,
  duration TEXT,
  intensity TEXT,
  medications TEXT,
  allergies TEXT,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  temperature DECIMAL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  oxygen_saturation INTEGER,
  priority TEXT DEFAULT 'Não triado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completed patients table
CREATE TABLE completed_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  arrival_time TEXT,
  completed_time TEXT,
  priority TEXT,
  symptoms TEXT[],
  duration TEXT,
  intensity TEXT,
  medications TEXT,
  diagnosis TEXT,
  completion_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient history table
CREATE TABLE patient_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  medications TEXT,
  evolution TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE pending_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triages ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_history ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Enable all operations for authenticated users" ON pending_patients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON patients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON triages
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON completed_patients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON patient_history
  FOR ALL TO authenticated USING (true);
```

### 4. Installation

```bash
npm install
```

### 5. Development

```bash
npm run dev
```

## User Roles and Access

- **Nurse (enfermeiro)**: Access to triage forms and pending patients
- **Doctor (medico)**: Access to patient lists and medical records
- **Admin (admin)**: Full system access and dashboard
- **Reception (recepcao)**: Patient queue management

## Default Login Credentials

- **Doctor**: ana.souza@example.com / password123
- **Nurse**: carlos.lima@example.com / password123
- **Admin**: admin@example.com / password123
- **Reception**: recepcao@example.com / password123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.