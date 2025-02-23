import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { Filter, CheckCircle, Search, PenTool as Tool, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import ScrollableDialog from '../components/ScrollableDialog';
import type { Database } from '../types/supabase';

type WorkOrder = Database['public']['Tables']['work_orders']['Row'] & {
  machine: Database['public']['Tables']['machines']['Row'] | null;
};

type DateFilter = 'all' | 'today' | 'week' | 'month';

const WorkOrderList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [machines, setMachines] = useState<Database['public']['Tables']['machines']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [closeFormData, setCloseFormData] = useState({
    actualCompletionDate: '',
    actualCompletionTime: '',
    resolutionDetails: '',
    partsReplaced: '',
    additionalNotes: '',
    technicianSignature: ''
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchMachines();

    const subscription = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        fetchWorkOrders
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      showToast.error('Failed to fetch machines');
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          machine:machines(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkOrders(data || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      showToast.error('Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  };

  const getDateFilteredOrders = (orders: WorkOrder[]) => {
    const now = new Date();
    const today = now.toDateString();
    const weekStart = startOfWeek(now).getTime();
    const monthStart = startOfMonth(now).getTime();

    switch (dateFilter) {
      case 'today':
        return orders.filter(order => 
          new Date(order.created_at).toDateString() === today
        );
      case 'week':
        return orders.filter(order => 
          new Date(order.created_at).getTime() >= weekStart
        );
      case 'month':
        return orders.filter(order => 
          new Date(order.created_at).getTime() >= monthStart
        );
      default:
        return orders;
    }
  };

  const filteredOrders = getDateFilteredOrders(workOrders)
    .filter(order => {
      const matchesStatus = filter === 'all' ? true : order.status === filter;
      const matchesPriority = priorityFilter === 'all' ? true : order.priority === priorityFilter;
      const matchesMachine = machineFilter === 'all' ? true : order.machine_id === machineFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        (order.problem_description?.toLowerCase().includes(searchLower) || false) ||
        (order.machine?.name?.toLowerCase().includes(searchLower) || false) ||
        (order.assigned_technician?.toLowerCase().includes(searchLower) || false);
      return matchesStatus && matchesPriority && matchesMachine && matchesSearch;
    });

  const getPriorityBadgeClass = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleCloseWorkOrder = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowCloseModal(true);
    setCloseFormData({
      actualCompletionDate: format(new Date(), 'yyyy-MM-dd'),
      actualCompletionTime: format(new Date(), 'HH:mm'),
      resolutionDetails: '',
      partsReplaced: '',
      additionalNotes: '',
      technicianSignature: ''
    });
  };

  const handleViewDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleSubmitClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || completing) return;

    try {
      setCompleting(selectedOrder.id);
      const {
        actualCompletionDate,
        actualCompletionTime,
        resolutionDetails,
        partsReplaced,
        additionalNotes,
        technicianSignature
      } = closeFormData;

      const actualCompletionDateTime = new Date(`${actualCompletionDate}T${actualCompletionTime}`).toISOString();

      const { error } = await supabase
        .from('work_orders')
        .update({
          status: 'completed',
          actual_completion_date: actualCompletionDateTime,
          resolution_details: resolutionDetails,
          parts_replaced: partsReplaced ? partsReplaced.split(',').map(part => part.trim()) : null,
          additional_notes: additionalNotes,
          technician_signature: technicianSignature
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      showToast.success('Work order closed successfully');
      setShowCloseModal(false);
      await fetchWorkOrders();
    } catch (error) {
      console.error('Error closing work order:', error);
      showToast.error('Failed to close work order');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">Work Orders</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 py-2"
            />
          </div>
          
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="form-input py-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
            className="form-input py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="form-input py-2"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Machine Filter */}
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="form-input py-2"
          >
            <option value="all">All Machines</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="card hover:border-indigo-500/30 glow cursor-pointer"
            onClick={() => handleViewDetails(order)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gradient">
                      {order.machine?.name || 'Unknown Machine'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadgeClass(
                        order.priority
                      )}`}
                    >
                      {order.priority?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-2">{order.problem_description}</p>
                </div>
                <span
                  className={`badge ${
                    order.status === 'pending'
                      ? 'badge-pending'
                      : 'badge-completed'
                  }`}
                >
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                <div>
                  <p className="font-medium text-gray-300">Assigned To</p>
                  <p>{order.assigned_technician || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-300">Start Date</p>
                  <p>{order.problem_start_date ? format(new Date(order.problem_start_date), 'PPp') : 'Not set'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-300">Expected Completion</p>
                  <p>{order.expected_completion_date ? format(new Date(order.expected_completion_date), 'PPp') : 'Not set'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-300">Created By</p>
                  <p>{order.created_by || 'Unknown'}</p>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseWorkOrder(order);
                    }}
                    disabled={completing === order.id}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {completing === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Closing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Close Work Order</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No work orders found
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <ScrollableDialog
        title="Work Order Details"
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gradient">
                  {selectedOrder.machine?.name || 'Unknown Machine'}
                </h3>
                <span
                  className={`badge ${
                    selectedOrder.status === 'pending'
                      ? 'badge-pending'
                      : 'badge-completed'
                  }`}
                >
                  {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Unknown'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-300">Priority</h4>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadgeClass(
                      selectedOrder.priority
                    )}`}
                  >
                    {selectedOrder.priority?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Created By</h4>
                  <p className="mt-1 text-gray-400">{selectedOrder.created_by}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-300">Problem Description</h4>
                <p className="mt-1 text-gray-400">{selectedOrder.problem_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-300">Start Date</h4>
                  <p className="mt-1 text-gray-400">
                    {selectedOrder.problem_start_date
                      ? format(new Date(selectedOrder.problem_start_date), 'PPp')
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Expected Completion</h4>
                  <p className="mt-1 text-gray-400">
                    {selectedOrder.expected_completion_date
                      ? format(new Date(selectedOrder.expected_completion_date), 'PPp')
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {selectedOrder.status === 'completed' && (
                <>
                  <div className="border-t border-gray-700/50 pt-4">
                    <h4 className="font-medium text-gray-300">Resolution Details</h4>
                    <p className="mt-1 text-gray-400">{selectedOrder.resolution_details || 'No details provided'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-300">Parts Replaced</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(selectedOrder.parts_replaced) && selectedOrder.parts_replaced.length > 0 ? (
                        selectedOrder.parts_replaced.map((part, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm bg-gray-700/50 border border-gray-600/50"
                          >
                            {part}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No parts replaced</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-300">Completion Date</h4>
                      <p className="mt-1 text-gray-400">
                        {selectedOrder.actual_completion_date
                          ? format(new Date(selectedOrder.actual_completion_date), 'PPp')
                          : 'Not completed'}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.additional_notes && (
                    <div>
                      <h4 className="font-medium text-gray-300">Additional Notes</h4>
                      <p className="mt-1 text-gray-400">{selectedOrder.additional_notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-300">Completed By</h4>
                    <p className="mt-1 text-gray-400">{selectedOrder.technician_signature || 'Not signed'}</p>
                  </div>
                </>
              )}
            </div>

            {selectedOrder.status === 'pending' && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(false);
                    handleCloseWorkOrder(selectedOrder);
                  }}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Close Work Order</span>
                </button>
              </div>
            )}
          </div>
        )}
      </ScrollableDialog>

      {/* Close Work Order Dialog */}
      <ScrollableDialog
        title="Close Work Order"
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
      >
        <form onSubmit={handleSubmitClose} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Actual Completion Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={closeFormData.actualCompletionDate}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, actualCompletionDate: e.target.value }))}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Actual Completion Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  value={closeFormData.actualCompletionTime}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, actualCompletionTime: e.target.value }))}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution Details
            </label>
            <div className="relative">
              <Tool className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={closeFormData.resolutionDetails}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, resolutionDetails: e.target.value }))}
                className="form-input pl-10"
                rows={4}
                placeholder="Describe how the issue was resolved..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parts Replaced
            </label>
            <input
              type="text"
              value={closeFormData.partsReplaced}
              onChange={(e) => setCloseFormData(prev => ({ ...prev, partsReplaced: e.target.value }))}
              className="form-input"
              placeholder="Enter parts replaced (comma-separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={closeFormData.additionalNotes}
              onChange={(e) => setCloseFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="form-input"
              rows={3}
              placeholder="Any additional notes or recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Technician's Signature
            </label>
            <input
              type="text"
              value={closeFormData.technicianSignature}
              onChange={(e) => setCloseFormData(prev => ({ ...prev, technicianSignature: e.target.value }))}
              className="form-input"
              placeholder="Enter your name as signature"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCloseModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={completing === selectedOrder?.id}
            >
              {completing === selectedOrder?.id ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit & Close Work Order'
              )}
            </button>
          </div>
        </form>
      </ScrollableDialog>
    </div>
  );
};

export default WorkOrderList;