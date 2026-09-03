// Print styles for the A4 repair job bill. Sized to comfortably fit a single
// page: compact spacing/fonts, logo top-left. Kept separate from markup so
// the document builder files stay easy to scan.
export const A4_REPAIR_BILL_STYLES = `
  @page { size: A4; margin: 10mm 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    font-size: 11.5px;
    line-height: 1.4;
    margin: 0;
  }
  .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 2px solid #1f2937; padding-bottom: 8px; margin-bottom: 8px; }
  .header .brand { display: flex; align-items: center; gap: 10px; }
  .header .logo { height: 44px; width: auto; object-fit: contain; }
  .header h1 { margin: 0; font-size: 16px; }
  .header .meta { font-size: 10px; color: #4b5563; }
  .header .bill-id { text-align: right; font-size: 11px; white-space: nowrap; }
  .title { text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 1px; margin: 0 0 10px; }
  section { margin-bottom: 9px; }
  h2 { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; margin: 0 0 5px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 24px; font-size: 11.5px; }
  .grid-2 span.label { color: #6b7280; }
  ul { margin: 3px 0; padding-left: 18px; }
  ul.damage-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: 0; }
  p { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #d1d5db; padding: 4px 7px; text-align: left; }
  th { background: #f3f4f6; }
  td.num, th.num { text-align: right; }
  .totals { width: 50%; margin-left: auto; font-size: 11.5px; }
  .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
  .totals .grand { border-top: 2px solid #1f2937; font-weight: 700; font-size: 13px; margin-top: 3px; }
  .risk-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 7px 9px; font-size: 11px; }
  .risk-box ul { margin: 3px 0 5px 18px; padding: 0; }
  .warranty-box { background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 7px 9px; font-size: 11px; }
  .warranty-box .void-title { font-weight: 700; margin-top: 4px; }
  .warranty-box ul { margin: 2px 0 0 18px; }
  .approval-note { font-size: 10.5px; color: #374151; margin-top: 14px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 10px; gap: 30px; }
  .sig-block { flex: 1; text-align: center; }
  .sig-line { border-top: 1px solid #1f2937; margin-top: 26px; padding-top: 5px; font-size: 10.5px; color: #4b5563; }
  .footer-note { text-align: center; font-size: 10px; color: #6b7280; margin-top: 10px; }
`;
