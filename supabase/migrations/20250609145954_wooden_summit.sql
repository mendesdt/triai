/*
  # Schema para Sistema de Triagem Hospitalar

  1. Novas Tabelas
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text) - medico, enfermeiro, admin, recepcao
      - `avatar` (text, optional)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `patients_queue`
      - `id` (uuid, primary key)
      - `name` (text)
      - `cpf` (text)
      - `arrival_time` (text)
      - `entry_date` (date)
      - `status` (text) - waiting, in-triage, completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `triages`
      - `id` (uuid, primary key)
      - `patient_queue_id` (uuid, foreign key)
      - `name` (text)
      - `cpf` (text)
      - `birth_date` (date)
      - `mother_name` (text, optional)
      - `consult_reason` (text)
      - `symptoms` (text[])
      - `other_symptoms` (text, optional)
      - `duration` (text)
      - `intensity` (text)
      - `medications` (text, optional)
      - `allergies` (text, optional)
      - `priority` (text)
      - `vital_signs` (jsonb, optional)
      - `nurse_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas baseadas em roles
    - Usuários só podem ver dados do seu contexto
*/

-- Criar extensão para UUIDs se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('medico', 'enfermeiro', 'admin', 'recepcao')),
  avatar text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela da fila de triagem
CREATE TABLE IF NOT EXISTS patients_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cpf text NOT NULL,
  arrival_time text NOT NULL,
  entry_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-triage', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de triagens realizadas
CREATE TABLE IF NOT EXISTS triages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_queue_id uuid REFERENCES patients_queue(id) ON DELETE SET NULL,
  name text NOT NULL,
  cpf text NOT NULL,
  birth_date date,
  mother_name text,
  consult_reason text NOT NULL,
  symptoms text[] DEFAULT '{}',
  other_symptoms text,
  duration text NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('Leve', 'Moderada', 'Alta')),
  medications text,
  allergies text,
  priority text DEFAULT 'Não triado' CHECK (priority IN ('Alta', 'Média', 'Baixa', 'Não triado')),
  vital_signs jsonb,
  nurse_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE triages ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Políticas para patients_queue
CREATE POLICY "Reception can manage queue"
  ON patients_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('recepcao', 'admin')
    )
  );

CREATE POLICY "Nurses can read queue"
  ON patients_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('enfermeiro', 'admin')
    )
  );

CREATE POLICY "Nurses can update queue status"
  ON patients_queue
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('enfermeiro', 'admin')
    )
  );

-- Políticas para triages
CREATE POLICY "Healthcare staff can read triages"
  ON triages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('medico', 'enfermeiro', 'admin')
    )
  );

CREATE POLICY "Nurses can create triages"
  ON triages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('enfermeiro', 'admin')
    )
  );

CREATE POLICY "Nurses can update their triages"
  ON triages
  FOR UPDATE
  TO authenticated
  USING (
    nurse_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Nurses can delete their triages"
  ON triages
  FOR DELETE
  TO authenticated
  USING (
    nurse_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Inserir usuários de exemplo
INSERT INTO users (email, name, role, avatar) VALUES
  ('ana.souza@example.com', 'Dr. Ana Souza', 'medico', 'https://i.pravatar.cc/150?img=5'),
  ('joao.souza@example.com', 'Dr. João Souza', 'medico', 'https://i.pravatar.cc/150?img=8'),
  ('carlos.lima@example.com', 'Enf. Carlos Lima', 'enfermeiro', 'https://i.pravatar.cc/150?img=11'),
  ('maria.silva@example.com', 'Enf. Maria Silva', 'enfermeiro', 'https://i.pravatar.cc/150?img=9'),
  ('admin@example.com', 'Admin. Roberto Santos', 'admin', 'https://i.pravatar.cc/150?img=7'),
  ('recepcao@example.com', 'Recep. Paula Costa', 'recepcao', 'https://i.pravatar.cc/150?img=10')
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns pacientes de exemplo na fila
INSERT INTO patients_queue (name, cpf, arrival_time, status) VALUES
  ('Carlos Eduardo Santos', '123.456.789-01', '08:30', 'waiting'),
  ('Fernanda Silva Costa', '987.654.321-09', '08:45', 'waiting'),
  ('Roberto Oliveira Lima', '456.789.123-45', '09:00', 'in-triage')
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_queue_updated_at BEFORE UPDATE ON patients_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triages_updated_at BEFORE UPDATE ON triages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();