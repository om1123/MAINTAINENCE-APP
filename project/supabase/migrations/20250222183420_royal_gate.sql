/*
  # Initial Schema Setup for Maintenance Management System

  1. New Tables
    - `machines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (text)
      - `manufacturer` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `work_orders`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, foreign key)
      - `problem_description` (text)
      - `problem_start_date` (timestamp)
      - `created_by` (text)
      - `status` (text)
      - `correction_details` (text, nullable)
      - `completed_date` (timestamp, nullable)
      - `completed_by` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text)
      - `message` (text)
      - `work_order_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `read` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Machines table
CREATE TABLE machines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location text NOT NULL,
  manufacturer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read machines"
  ON machines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert machines"
  ON machines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update machines"
  ON machines
  FOR UPDATE
  TO authenticated
  USING (true);

-- Work Orders table
CREATE TABLE work_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE,
  problem_description text NOT NULL,
  problem_start_date timestamptz NOT NULL,
  created_by text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed')),
  correction_details text,
  completed_date timestamptz,
  completed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read work orders"
  ON work_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert work orders"
  ON work_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update work orders"
  ON work_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('new', 'pending', 'completed')),
  message text NOT NULL,
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on work order changes
CREATE OR REPLACE FUNCTION create_work_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (type, message, work_order_id)
    VALUES (
      'new',
      'New work order created for ' || (SELECT name FROM machines WHERE id = NEW.machine_id),
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
    INSERT INTO notifications (type, message, work_order_id)
    VALUES (
      'completed',
      'Work order completed for ' || (SELECT name FROM machines WHERE id = NEW.machine_id),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER work_order_notification_trigger
  AFTER INSERT OR UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_work_order_notification();