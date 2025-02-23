import { utils, writeFile } from 'xlsx';
import { supabase } from './supabase';
import { format } from 'date-fns';

export async function exportToExcel() {
  try {
    // Fetch all data
    const [machinesResult, workOrdersResult] = await Promise.all([
      supabase.from('machines').select('*'),
      supabase.from('work_orders').select(`
        *,
        machine:machines(name)
      `)
    ]);

    if (machinesResult.error) throw machinesResult.error;
    if (workOrdersResult.error) throw workOrdersResult.error;

    // Prepare machines worksheet
    const machinesData = machinesResult.data.map(machine => ({
      'Machine ID': machine.id,
      'Name': machine.name,
      'Location': machine.location,
      'Manufacturer': machine.manufacturer,
      'Created At': format(new Date(machine.created_at), 'PPpp'),
      'Updated At': format(new Date(machine.updated_at), 'PPpp')
    }));

    // Prepare work orders worksheet with detailed information
    const workOrdersData = workOrdersResult.data.map(order => ({
      'Work Order ID': order.id,
      'Machine': order.machine?.name,
      'Problem Description': order.problem_description,
      'Priority': order.priority?.toUpperCase() || 'N/A',
      'Status': order.status?.toUpperCase() || 'N/A',
      'Assigned Technician': order.assigned_technician || 'N/A',
      'Problem Start Date': format(new Date(order.problem_start_date), 'PPpp'),
      'Expected Completion': order.expected_completion_date ? format(new Date(order.expected_completion_date), 'PPpp') : 'N/A',
      'Created By': order.created_by,
      'Resolution Details': order.resolution_details || 'N/A',
      'Parts Replaced': Array.isArray(order.parts_replaced) ? order.parts_replaced.join(', ') : 'None',
      'Additional Notes': order.additional_notes || 'N/A',
      'Completed By': order.technician_signature || 'N/A',
      'Actual Completion Date': order.actual_completion_date ? format(new Date(order.actual_completion_date), 'PPpp') : 'N/A',
      'Created At': format(new Date(order.created_at), 'PPpp'),
      'Updated At': format(new Date(order.updated_at), 'PPpp')
    }));

    // Create workbook
    const wb = utils.book_new();

    // Add worksheets
    utils.book_append_sheet(wb, utils.json_to_sheet(machinesData), 'Machines');
    utils.book_append_sheet(wb, utils.json_to_sheet(workOrdersData), 'Work Orders');

    // Generate filename with current date
    const filename = `maintenance_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Save file
    writeFile(wb, filename);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}