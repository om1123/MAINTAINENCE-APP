/*
  # Fix RLS policies for machines table

  1. Changes
    - Drop existing RLS policies for machines table
    - Create new, more permissive policies for all operations
    - Enable public access for all authenticated users

  2. Security
    - Enables read, insert, update, and delete access for all authenticated users
    - Maintains RLS enforcement while allowing necessary operations
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON machines;

-- Create new, simplified policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON machines
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;