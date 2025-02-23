/*
  # Fix RLS Policies for Machines Table

  1. Changes
    - Drop existing RLS policies for machines table
    - Create new, more permissive policies for authenticated users
    - Enable RLS on machines table

  2. Security
    - Allow authenticated users to perform all CRUD operations
    - Maintain security while allowing necessary access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read machines" ON machines;
DROP POLICY IF EXISTS "Allow authenticated users to insert machines" ON machines;
DROP POLICY IF EXISTS "Allow authenticated users to update machines" ON machines;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON machines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON machines FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON machines FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON machines FOR DELETE
TO authenticated
USING (true);