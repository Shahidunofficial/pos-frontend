// Renders a full A4 HTML document (e.g. an invoice) into a hidden iframe so
// the user can pick their regular printer from the normal print dialog. The
// document itself triggers window.print() on load, which correctly waits
// for images (like a logo) to finish loading before printing.
export function printA4Document(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position: fixed; right: 0; top: 0; width: 0; height: 0; border: none;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error('Could not access iframe document')
  }

  doc.open()
  doc.write(html)
  doc.close()

  const checkDone = setInterval(() => {
    if (iframe.contentWindow?.document.readyState === 'complete') {
      clearInterval(checkDone)
      setTimeout(() => document.body.contains(iframe) && document.body.removeChild(iframe), 2000)
    }
  }, 1000)
}
