import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, PenTool as Tool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import type { Database } from '../types/supabase';

type Machine = Database['public']['Tables']['machines']['Row'];

const MachineList: React.FC = () => {
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    location: '',
    manufacturer: ''
  });

  useEffect(() => {
    fetchMachines();

    const subscription = supabase
      .channel('machines_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machines' },
        fetchMachines
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      showToast.error('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('machines')
        .insert([{
          ...newMachine,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowAddMachine(false);
      setNewMachine({ name: '', location: '', manufacturer: '' });
      showToast.success('Machine added successfully');
      fetchMachines();
    } catch (error) {
      console.error('Error adding machine:', error);
      showToast.error('Failed to add machine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast.success('Machine deleted successfully');
      fetchMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
      showToast.error('Failed to delete machine');
    }
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gradient">Asset Management</h1>
        <button
          onClick={() => setShowAddMachine(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Machine
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search machines..."
          className="form-input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div key={machine.id} className="card hover:border-indigo-500/30 glow">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gradient">{machine.name}</h3>
              <div className="mt-4 space-y-2 text-gray-300">
                <p>
                  <span className="font-medium text-indigo-400">Location:</span> {machine.location}
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Manufacturer:</span> {machine.manufacturer}
                </p>
              </div>
              <div className="mt-6 flex space-x-3">
                <Link
                  to={`/create-work-order?machine=${machine.id}`}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  <Tool className="w-4 h-4 mr-2" />
                  Create Work Order
                </Link>
                <button
                  onClick={() => handleDeleteMachine(machine.id)}
                  className="btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMachines.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No machines found
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      {showAddMachine && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold text-gradient mb-4">Add New Machine</h2>
            <form onSubmit={handleAddMachine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Machine Name</label>
                <input
                  type="text"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Location</label>
                <input
                  type="text"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, location: e.target.value }))}
                  className="form-input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Manufacturer</label>
                <input
                  type="text"
                  value={newMachine.manufacturer}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="form-input mt-1"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMachine(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Machine'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;