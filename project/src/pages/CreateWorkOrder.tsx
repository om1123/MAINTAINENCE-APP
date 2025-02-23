import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import type { Database } from '../types/supabase';

type Machine = Database['public']['Tables']['machines']['Row'];

const CreateWorkOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    machineId: searchParams.get('machine') || '',
    problemDescription: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assignedTechnician: '',
    problemStartDate: '',
    problemStartTime: '',
    expectedCompletionDate: '',
    expectedCompletionTime: '',
    createdBy: ''
  });

  useEffect(() => {
    fetchMachines();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const {
        machineId,
        problemDescription,
        priority,
        assignedTechnician,
        problemStartDate,
        problemStartTime,
        expectedCompletionDate,
        expectedCompletionTime,
        createdBy
      } = formData;

      const problemStartDateTime = new Date(`${problemStartDate}T${problemStartTime}`).toISOString();
      const expectedCompletionDateTime = new Date(`${expectedCompletionDate}T${expectedCompletionTime}`).toISOString();

      const { error } = await supabase
        .from('work_orders')
        .insert([{
          machine_id: machineId,
          problem_description: problemDescription,
          priority,
          assigned_technician: assignedTechnician,
          problem_start_date: problemStartDateTime,
          expected_completion_date: expectedCompletionDateTime,
          created_by: createdBy,
          status: 'pending'
        }]);

      if (error) throw error;

      showToast.success('Work order created successfully');
      navigate('/work-orders');
    } catch (error) {
      console.error('Error creating work order:', error);
      showToast.error('Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gradient mb-8">Create Work Order</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Machine Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Machine
          </label>
          <select
            name="machineId"
            value={formData.machineId}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select a machine...</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.name} - {machine.location}
              </option>
            ))}
          </select>
        </div>

        {/* Problem Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Problem Description
          </label>
          <textarea
            name="problemDescription"
            value={formData.problemDescription}
            onChange={handleChange}
            rows={4}
            className="form-input"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority Level
          </label>
          <div className="flex space-x-4">
            {['high', 'medium', 'low'].map((priority) => (
              <label key={priority} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.priority === priority}
                  onChange={handleChange}
                  className="form-radio text-indigo-500"
                />
                <span className="capitalize text-gray-300">{priority}</span>
                {priority === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Assigned Technician */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Assigned Technician
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="assignedTechnician"
              value={formData.assignedTechnician}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter technician name"
              required
            />
          </div>
        </div>

        {/* Problem Start Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="problemStartDate"
                value={formData.problemStartDate}
                onChange={handleChange}
                className="form-input pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                name="problemStartTime"
                value={formData.problemStartTime}
                onChange={handleChange}
                className="form-input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Expected Completion Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expected Completion Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="expectedCompletionDate"
                value={formData.expectedCompletionDate}
                onChange={handleChange}
                className="form-input pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expected Completion Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                name="expectedCompletionTime"
                value={formData.expectedCompletionTime}
                onChange={handleChange}
                className="form-input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Created By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Created By
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter your name"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="btn btn-primary glow"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating Work Order...
              </>
            ) : (
              'Create Work Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkOrder;