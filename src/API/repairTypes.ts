export type RepairType = 'iphone_battery' | 'iphone_display' | 'iphone_no_power' | 'other';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type RepairBillStatus = 'pending' | 'in_progress' | 'completed';

export interface RepairAppointment {
  _id: string;
  userId: { _id: string; name: string; email?: string } | string;
  repairType: RepairType;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  contactNumber: string;
  scheduledAt: string;
  status: AppointmentStatus;
  createdAt: string;
}

// A part used on the repair. `productId` is set when picked from the product
// catalog; price stays editable either way, and parts not in stock can be
// typed in manually without a productId.
export interface RepairPart {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RepairBill {
  _id: string;
  appointmentId?: string;
  customerName: string;
  contactNumber: string;
  deviceBrand: string;
  deviceModel: string;
  repairType: RepairType;
  faultDescription: string;
  preExistingDamages: string[];
  damageNotes: string;
  motherboardConditions: string[];
  repairRisksAcknowledged: string[];
  riskConsentAcknowledged: boolean;
  customerApproved: boolean;
  warrantyMonths: number;
  warrantyCoverage: string;
  warrantyVoidConditions: string[];
  parts: RepairPart[];
  partsCost: number;
  laborCost: number;
  otherCharges: number;
  total: number;
  status: RepairBillStatus;
  createdAt: string;
}

export interface CreateRepairBillRequest {
  appointmentId?: string;
  customerName: string;
  contactNumber: string;
  deviceBrand: string;
  deviceModel: string;
  repairType: RepairType;
  faultDescription: string;
  preExistingDamages: string[];
  damageNotes?: string;
  motherboardConditions: string[];
  repairRisksAcknowledged: string[];
  riskConsentAcknowledged: boolean;
  customerApproved: boolean;
  warrantyMonths: number;
  warrantyCoverage: string;
  warrantyVoidConditions: string[];
  parts: RepairPart[];
  partsCost: number;
  laborCost: number;
  otherCharges: number;
}

export const REPAIR_TYPES: { value: RepairType; label: string }[] = [
  { value: 'iphone_battery', label: 'iPhone Battery' },
  { value: 'iphone_display', label: 'iPhone Display' },
  { value: 'iphone_no_power', label: 'iPhone No Power' },
  { value: 'other', label: 'Other' },
];

export const DAMAGE_OPTIONS: string[] = [
  'Cracked Screen',
  'Scratches on Body',
  'Dent / Bent Frame',
  'Water Damage',
  'Missing Back Cover',
  'Missing SIM Tray',
  'Camera Lens Cracked',
  'Battery Swollen',
];
