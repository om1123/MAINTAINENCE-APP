/*
  # Add system reset function

  1. New Functions
    - `reset_system`: Function to reset the entire system by clearing all tables

  2. Changes
    - Added a stored procedure to safely clear all tables
    - Handles foreign key constraints automatically
    - Maintains table structure while removing all data

  3. Security
    - Function is accessible to authenticated users only
*/

-- Create function to reset the system
CREATE OR REPLACE FUNCTION reset_system()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable triggers temporarily
  SET session_replication_role = 'replica';
  
  -- Delete data from all tables in the correct order
  DELETE FROM notifications;
  DELETE FROM work_orders;
  DELETE FROM machines;
  
  -- Re-enable triggers
  SET session_replication_role = 'origin';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_system TO authenticated;