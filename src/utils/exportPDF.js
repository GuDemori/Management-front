// src/utils/exportPDF.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportPdfWithLogo({ title, filename, headers, rows }) {
  const doc = new jsPDF()
  const logo = new Image()
  logo.src = new URL('@/assets/logo.png', import.meta.url).href

  logo.onload = () => {
    const logoX = 14
    const logoY = 12
    const logoWidth = 30
    const logoHeight = 20

    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, logoX + logoWidth + 10, logoY + 8)

    const dataHora = new Date().toLocaleString('pt-BR')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Emitido em: ${dataHora}`, 200 - 14, logoY + 8, { align: 'right' })

    doc.setDrawColor(180)
    doc.line(14, logoY + logoHeight + 2, 200 - 14, logoY + logoHeight + 2)

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: logoY + logoHeight + 8,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [33, 150, 243],
        halign: 'center',
        valign: 'middle',
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(9)
        doc.text(`Página ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10)
      },
    })

    doc.save(filename)
  }
}
