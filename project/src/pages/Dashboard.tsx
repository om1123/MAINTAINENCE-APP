import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Wrench, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Database } from '../types/supabase';

type WorkOrder = Database['public']['Tables']['work_orders']['Row'] & {
  machine: Database['public']['Tables']['machines']['Row'] | null;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeWorkOrders: 0,
    completedWorkOrders: 0
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ month: string; completed: number; created: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [machinesCount, workOrdersResult] = await Promise.all([
          supabase.from('machines').select('id', { count: 'exact' }),
          supabase
            .from('work_orders')
            .select(`
              *,
              machine:machines(*)
            `)
            .order('created_at', { ascending: false })
        ]);

        if (workOrdersResult.error) throw workOrdersResult.error;
        const workOrders = workOrdersResult.data;

        // Calculate basic stats
        const activeOrders = workOrders.filter(wo => wo.status === 'pending').length;
        const completedOrders = workOrders.filter(wo => wo.status === 'completed').length;

        setStats({
          totalMachines: machinesCount.count || 0,
          activeWorkOrders: activeOrders,
          completedWorkOrders: completedOrders
        });

        // Calculate monthly stats
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return date.toLocaleString('default', { month: 'short' });
        }).reverse();

        const monthlyData = last6Months.map(month => {
          const completed = workOrders.filter(wo => 
            wo.status === 'completed' && 
            new Date(wo.completed_date || '').toLocaleString('default', { month: 'short' }) === month
          ).length;

          const created = workOrders.filter(wo =>
            new Date(wo.created_at).toLocaleString('default', { month: 'short' }) === month
          ).length;

          return { month, completed, created };
        });

        setMonthlyStats(monthlyData);
        setRecentWorkOrders(workOrders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const workOrdersSubscription = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      workOrdersSubscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 slide-up" style={{ animationDelay: '0ms' }}>
          <h3 className="text-lg font-semibold text-indigo-300">Total Machines</h3>
          <p className="text-3xl font-bold text-gradient mt-2">{stats.totalMachines}</p>
        </div>
        <div className="card p-6 slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-indigo-300">Active Work Orders</h3>
          <p className="text-3xl font-bold text-gradient-warning mt-2">{stats.activeWorkOrders}</p>
        </div>
        <div className="card p-6 slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-indigo-300">Completed Work Orders</h3>
          <p className="text-3xl font-bold text-gradient-success mt-2">{stats.completedWorkOrders}</p>
        </div>
      </div>

      {/* Monthly Work Orders Chart */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gradient mb-4">Monthly Work Orders</h3>
        <div className="h-[300px]">
          <BarChart
            width={800}
            height={300}
            data={monthlyStats}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="created" name="Created" fill="#6366f1" />
            <Bar dataKey="completed" name="Completed" fill="#10B981" />
          </BarChart>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/create-work-order"
          className="btn-primary flex items-center justify-center p-4 slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Work Order
        </Link>
        <Link
          to="/machines"
          className="btn-secondary flex items-center justify-center p-4 slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <Wrench className="w-5 h-5 mr-2" />
          View Machines
        </Link>
        <Link
          to="/export"
          className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20 slide-up"
          style={{ animationDelay: '500ms' }}
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Export to Excel
        </Link>
      </div>

      {/* Recent Work Orders */}
      <div className="card p-6 slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-xl font-semibold text-gradient mb-4">Recent Work Orders</h2>
        <div className="space-y-4">
          {recentWorkOrders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b border-gray-700/50 pb-4 slide-in"
              style={{ animationDelay: `${700 + index * 100}ms` }}
            >
              <div>
                <h3 className="font-medium text-indigo-300">
                  {order.machine?.name || 'Unknown Machine'}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`badge ${
                  order.status === 'pending'
                    ? 'badge-pending'
                    : 'badge-completed'
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          ))}

          {recentWorkOrders.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              No work orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;