import { makeRequest } from './config';
import { RepairBill, CreateRepairBillRequest, RepairBillStatus } from './repairTypes';

export const repairBillsApi = {
  async getAll(): Promise<RepairBill[]> {
    return makeRequest<RepairBill[]>('/repair-bills');
  },

  async getById(id: string): Promise<RepairBill> {
    return makeRequest<RepairBill>(`/repair-bills/${id}`);
  },

  async create(bill: CreateRepairBillRequest): Promise<RepairBill> {
    return makeRequest<RepairBill>('/repair-bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    });
  },

  async updateStatus(id: string, status: RepairBillStatus): Promise<RepairBill> {
    return makeRequest<RepairBill>(`/repair-bills/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getPrintReceipt(id: string): Promise<{ receiptText: string }> {
    return makeRequest<{ receiptText: string }>(`/repair-bills/${id}/receipt/print`);
  },
};
