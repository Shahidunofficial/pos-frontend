import { makeRequest } from './config';
import { RepairAppointment } from './repairTypes';

export const appointmentsApi = {
  async getAllAdmin(): Promise<RepairAppointment[]> {
    return makeRequest<RepairAppointment[]>('/appointments/admin/all');
  },
};
