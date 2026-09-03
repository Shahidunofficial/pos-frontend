// Silently prints pre-formatted 80mm thermal receipt text via a hidden iframe.
// Shared by the sales checkout flow and the repair billing flow.
const THERMAL_PRINTER_NAME = 'Xprinter XP-T361U';

function buildReceiptHtml(receiptText: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      @page { margin: 0mm; size: 80mm auto; }
      body {
        font-family: 'Courier New', monospace;
        font-size: 25px;
        margin: 0mm;
        padding: 2mm;
        width: 76mm;
        line-height: 1.2;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      pre {
        margin: 0;
        white-space: pre;
        font-size: 17px;
        width: 78mm;
        font-family: 'Courier New', monospace;
        line-height: 1.4;
      }
      .receipt-content { width: 100%; max-width: 78mm; overflow-wrap: break-word; }
      @media print {
        @page { size: 80mm auto; margin: 0mm; }
        html, body { width: 80mm; margin: 0mm; padding: 0mm; height: auto; }
      }
    </style>
  </head>
  <body>
    <div class="receipt-content"><pre>${receiptText}</pre></div>
    <script>
      window.onload = function () {
        window.print();
      };
    </script>
  </body>
</html>`;
}

export function printThermalReceipt(receiptText: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position: fixed; right: 0; top: 0; width: 80mm; height: 100%; border: none; background: white; box-shadow: -2px 0 5px rgba(0,0,0,0.1); z-index: 9999;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not access iframe document');
  }

  doc.open();
  doc.write(buildReceiptHtml(receiptText));
  doc.close();

  const win = iframe.contentWindow as (Window & { webkitPrint?: (opts: unknown) => void; mozPrint?: (opts: unknown) => void }) | null;
  if (win && 'webkitPrint' in win && win.webkitPrint) {
    win.webkitPrint({ silent: true, deviceName: THERMAL_PRINTER_NAME, marginType: 'none' });
  } else if (win && 'mozPrint' in win && win.mozPrint) {
    win.mozPrint({ silent: true, printerName: THERMAL_PRINTER_NAME, paperWidth: '80mm' });
  } else {
    setTimeout(() => win?.print(), 100);
  }

  const checkDone = setInterval(() => {
    if (iframe.contentWindow?.document.readyState === 'complete') {
      clearInterval(checkDone);
      setTimeout(() => document.body.contains(iframe) && document.body.removeChild(iframe), 1000);
    }
  }, 1000);
}
