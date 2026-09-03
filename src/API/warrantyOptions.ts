import { RepairType } from './repairTypes';

export interface WarrantyPreset {
  id: string;
  label: string;
  months: number;
  coverage: string;
}

// Standard shop warranty presets. Cashier can still override months/coverage
// manually for edge cases via the custom fields in the warranty form.
export const WARRANTY_PRESETS: WarrantyPreset[] = [
  { id: 'none', label: 'No Warranty', months: 0, coverage: '' },
  {
    id: 'display',
    label: 'Display Replacement — 2 Months',
    months: 2,
    coverage: 'Touch fault / manufacturing fault only',
  },
  {
    id: 'battery',
    label: 'Battery Replacement — 3 Months',
    months: 3,
    coverage: 'Battery performance / manufacturing fault only',
  },
];

// Suggests which preset to highlight based on the selected repair type.
// This is only a hint — the cashier always makes the final selection.
export const RECOMMENDED_WARRANTY_ID_BY_REPAIR_TYPE: Partial<Record<RepairType, string>> = {
  iphone_display: 'display',
  iphone_battery: 'battery',
};

// Default warranty void conditions, shown once a warranty period is set.
// Staff can remove/add to this list per bill for repair-specific exclusions.
export const DEFAULT_WARRANTY_VOID_CONDITIONS: string[] = [
  'Physical damage, including cracks or drop damage',
  'Liquid/water damage',
  'Screen discoloration or color patches',
  'Unauthorized repair or tampering after handover',
];
