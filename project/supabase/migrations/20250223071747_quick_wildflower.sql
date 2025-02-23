/*
  # Add missing work order fields

  1. Changes
    - Add missing fields to work_orders table:
      - assigned_technician (text)
      - priority (enum)
      - expected_completion_date (timestamptz)
      - parts_replaced (json)
      - maintenance_cost (numeric)
      - resolution_details (text)
      - additional_notes (text)
      - technician_signature (text)
      - actual_completion_date (timestamptz)

  2. Security
    - Maintain existing RLS policies
*/

-- Create priority enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_priority') THEN
    CREATE TYPE work_order_priority AS ENUM ('high', 'medium', 'low');
  END IF;
END $$;

-- Add new columns to work_orders table
DO $$ 
BEGIN
  -- Add assigned_technician column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'assigned_technician'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN assigned_technician text;
  END IF;

  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'priority'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN priority work_order_priority;
  END IF;

  -- Add expected_completion_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'expected_completion_date'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN expected_completion_date timestamptz;
  END IF;

  -- Add parts_replaced column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'parts_replaced'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN parts_replaced json;
  END IF;

  -- Add maintenance_cost column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'maintenance_cost'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN maintenance_cost numeric(10,2);
  END IF;

  -- Add resolution_details column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'resolution_details'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN resolution_details text;
  END IF;

  -- Add additional_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN additional_notes text;
  END IF;

  -- Add technician_signature column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'technician_signature'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN technician_signature text;
  END IF;

  -- Add actual_completion_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' AND column_name = 'actual_completion_date'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN actual_completion_date timestamptz;
  END IF;
END $$;