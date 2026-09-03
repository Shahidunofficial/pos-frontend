// Section A — board-level defects a technician may find once the device is opened.
// These are especially relevant for "no power" faults, which are often caused by
// hidden CPU/PCB damage rather than the reported symptom.
export const MOTHERBOARD_CONDITIONS: string[] = [
  'CPU/SoC Cracked',
  'CPU/IC Solder Joints Damaged',
  'CPU Pads Lifted/Damaged',
  'PCB Solder-Pad Damaged',
  'PCB Track/Trace Broken',
  'PCB Layer Damage',
  'BGA Solder-Ball/Joint Failure',
  'Corrosion Around CPU/IC',
  'Heat-Damaged CPU/IC or PCB',
  'Missing Components Near CPU/IC',
  'Motherboard Flex/Bend Damage',
  'Previous CPU/IC Rework or Soldering',
  'Previous Unauthorized Motherboard Repair',
];

// Section B — risk statements explicitly disclosed to the customer before repair.
export const REPAIR_RISK_OPTIONS: string[] = [
  'Device has existing motherboard damage',
  'Device may become no-power (fail to switch on) during the repair process due to internal damage',
  'Additional faults may be discovered during repair',
  'Additional repair may be required',
  'Repair outcome cannot be guaranteed due to existing motherboard condition',
];

export const MOTHERBOARD_RISK_CONSENT_TEXT =
  'The customer understands that the device motherboard may contain hidden or pre-existing damage that ' +
  'cannot always be identified before disassembly. This may include CPU/SoC cracks or physical damage, ' +
  'cracked or weakened BGA solder joints, lifted or damaged CPU/IC pads, broken motherboard tracks/traces, ' +
  'damaged internal PCB layers, missing components, corrosion, heat damage, previous soldering/rework, and ' +
  "other motherboard-level defects. During disassembly, inspection, testing, or repair, such pre-existing " +
  "defects may become apparent and may affect the device's ability to operate. Where technically appropriate, " +
  'the technician will document the condition and inform the customer before undertaking additional ' +
  'chargeable work.';
