export interface Machine {
  id: string;
  name: string;
  location: string;
  manufacturer: string;
}

export interface WorkOrder {
  id: string;
  machineId: string;
  machineName: string;
  problemDescription: string;
  problemStartDate: string;
  createdBy: string;
  status: 'pending' | 'completed';
  correctionDetails?: string;
  completedDate?: string;
  completedBy?: string;
}

export interface Notification {
  id: string;
  type: 'new' | 'pending' | 'completed';
  message: string;
  timestamp: string;
  workOrderId: string;
}