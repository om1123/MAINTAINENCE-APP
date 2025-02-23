/*
  # Enable public access to all tables

  1. Changes
    - Drop existing RLS policies
    - Create new policies allowing public access to all operations
    - Keep RLS enabled but with public policies for:
      - machines table
      - work_orders table
      - notifications table

  2. Security Note
    - This configuration allows unrestricted public access
    - Suitable for development/demo purposes
    - Consider implementing proper authentication for production use
*/

-- First, drop existing policies for machines
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON machines;

-- Create new public policies for machines
CREATE POLICY "Allow public access to all operations on machines"
ON machines FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies for work_orders
DROP POLICY IF EXISTS "Allow authenticated users to read work orders" ON work_orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert work orders" ON work_orders;
DROP POLICY IF EXISTS "Allow authenticated users to update work orders" ON work_orders;

-- Create new public policies for work_orders
CREATE POLICY "Allow public access to all operations on work orders"
ON work_orders FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies for notifications
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON notifications;

-- Create new public policies for notifications
CREATE POLICY "Allow public access to all operations on notifications"
ON notifications FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure RLS remains enabled for all tables
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;