import { RepairType, RepairPart, DEFAULT_WARRANTY_VOID_CONDITIONS } from '@/API'

export interface RepairBillFormState {
  appointmentId?: string
  customerName: string
  contactNumber: string
  deviceBrand: string
  deviceModel: string
  repairType: RepairType
  faultDescription: string
  preExistingDamages: string[]
  damageNotes: string
  motherboardConditions: string[]
  repairRisksAcknowledged: string[]
  riskConsentAcknowledged: boolean
  customerApproved: boolean
  warrantyMonths: number
  warrantyCoverage: string
  warrantyVoidConditions: string[]
  parts: RepairPart[]
  laborCost: number
  otherCharges: number
}

export type ChecklistField = 'preExistingDamages' | 'motherboardConditions' | 'repairRisksAcknowledged'

export const emptyRepairBillForm: RepairBillFormState = {
  customerName: '',
  contactNumber: '',
  deviceBrand: '',
  deviceModel: '',
  repairType: 'other',
  faultDescription: '',
  preExistingDamages: [],
  damageNotes: '',
  motherboardConditions: [],
  repairRisksAcknowledged: [],
  riskConsentAcknowledged: false,
  customerApproved: false,
  warrantyMonths: 0,
  warrantyCoverage: '',
  warrantyVoidConditions: [...DEFAULT_WARRANTY_VOID_CONDITIONS],
  parts: [],
  laborCost: 0,
  otherCharges: 0,
}
