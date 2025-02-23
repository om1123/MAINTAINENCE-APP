import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: '#1F2937',
        color: '#fff',
        border: '1px solid #374151',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#fff',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: '#1F2937',
        color: '#fff',
        border: '1px solid #374151',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#fff',
      },
    });
  },
};