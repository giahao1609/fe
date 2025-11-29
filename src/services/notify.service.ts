import { toast } from 'sonner';

export const NotifyService = {
  success(message: string, options?: any) {
    toast.success(message, options);
  },

  error(message: string, options?: any) {
    toast.error(message, options);
  },

  warn(message: string, options?: any) {
    if (typeof (toast as any).warning === 'function') {
      (toast as any).warning(message, options);
    } else {
      toast(message, options);
    }
  },

  info(message: string, options?: any) {
    if (typeof (toast as any).info === 'function') {
      (toast as any).info(message, options);
    } else {
      toast(message, options);
    }
  },
};
