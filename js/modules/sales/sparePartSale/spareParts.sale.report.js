// js/core/reports/sparePartsSale/spare.parts.sale.report.js

const fmt = (val) =>
    `$${Number(val ?? 0).toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const drawFooter = (doc, pageW, pageH, margin) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 16, pageW - margin, pageH - 16);
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Leal Import · Documento generado automáticamente', margin, pageH - 10);
    doc.text(new Date().toLocaleString('es-SV'), pageW - margin, pageH - 10, { align: 'right' });
};

const checkPageBreak = (doc, y, needed, pageH, margin, pageW) => {
    if (y + needed > pageH - 24) {
        drawFooter(doc, pageW, pageH, margin);
        doc.addPage();
        return 20;
    }
    return y;
};

const drawSectionHeader = (doc, label, y, margin, contentW, rightText = '') => {
    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 7, y + 6);
    if (rightText) {
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(7);
        doc.text(rightText, margin + contentW - 4, y + 6, { align: 'right' });
    }
    return y + 9;
};

export const generateSparePartsSaleReport = (sale) => {
    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF();
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const margin   = 14;
    const contentW = pageW - margin * 2;

    const payments          = sale.sparePartsPayments || [];
    const items             = sale.sparePartsSaleItems || [];
    const hasDebt           = Number(sale.amountDue ?? 0) > 0;
    const estadoLabel       = sale.statusSaleName || '—';

    // ═══════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════
    doc.setFillColor(211, 24, 19);
    doc.rect(0, 0, pageW, 36, 'F');
    doc.setFillColor(160, 18, 14);
    doc.rect(0, 32, pageW, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Leal Import', margin, 22);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(`Registrado por: ${sale.employeeName || '—'}`, margin, 29);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE VENTA DE REPUESTOS', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(`N° ${String(sale.idSparePartsSales).slice(0, 8).toUpperCase()}`, pageW - margin, 28, { align: 'right' });

    // ═══════════════════════════════════════
    // META — fecha + badges
    // ═══════════════════════════════════════
    let y = 48;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text('Fecha de emisión:', margin, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(
        new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' }),
        margin + 32, y
    );

    // Badge deuda
    const badgeW = 28;
    doc.setFillColor(hasDebt ? 211 : 46, hasDebt ? 24 : 125, hasDebt ? 19 : 50);
    doc.roundedRect(pageW - margin - badgeW, y - 5, badgeW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(hasDebt ? 'CON DEUDA' : 'SALDADO', pageW - margin - badgeW / 2, y, { align: 'center' });

    // Badge estado
    const estadoColor = estadoLabel === 'Reservado' ? [245, 158, 11] : [46, 125, 50];
    const estadoW = 36;
    doc.setFillColor(...estadoColor);
    doc.roundedRect(pageW - margin - badgeW - estadoW - 4, y - 5, estadoW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(estadoLabel.toUpperCase(), pageW - margin - badgeW - estadoW - 4 + estadoW / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // DOS COLUMNAS — Cliente | Info venta
    // ═══════════════════════════════════════
    const colW  = (contentW - 6) / 2;
    const col2X = margin + colW + 6;
    const boxH  = 44;

    // Cliente
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, colW, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, colW, boxH, 3, 3, 'S');
    doc.setFillColor(211, 24, 19);
    doc.roundedRect(margin + 4, y + 4, 22, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', margin + 15, y + 7.5, { align: 'center' });
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(sale.customerName || '—', margin + 4, y + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Estado: ${estadoLabel}`, margin + 4, y + 27);
    doc.text(`Fecha venta: ${sale.saleDate || '—'}`, margin + 4, y + 35);

    // Info venta
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'S');
    doc.setFillColor(211, 24, 19);
    doc.roundedRect(col2X + 4, y + 4, 28, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('INFO DE VENTA', col2X + 18, y + 7.5, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Precio de venta:', col2X + 4, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(fmt(sale.salePrice), col2X + colW - 4, y + 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Total abonado:', col2X + 4, y + 27);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(109, 190, 69);
    doc.text(fmt(sale.totalPaid), col2X + colW - 4, y + 27, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Deuda:', col2X + 4, y + 36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hasDebt ? 211 : 109, hasDebt ? 24 : 190, hasDebt ? 19 : 69);
    doc.text(fmt(sale.amountDue), col2X + colW - 4, y + 36, { align: 'right' });

    y += boxH + 10;

    // ═══════════════════════════════════════
    // RAZÓN DE CANCELACIÓN (si existe)
    // ═══════════════════════════════════════
    if (sale.cancellationReason?.trim()) {
        y = checkPageBreak(doc, y, 22, pageH, margin, pageW);
        const lines    = doc.splitTextToSize(sale.cancellationReason.trim(), contentW - 12);
        const cancelH  = Math.max(18, lines.length * 5 + 14);

        doc.setFillColor(255, 235, 235);
        doc.setDrawColor(211, 24, 19);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, cancelH, 2, 2, 'FD');
        doc.setFillColor(211, 24, 19);
        doc.roundedRect(margin + 4, y + 4, 38, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('RAZÓN DE CANCELACIÓN', margin + 23, y + 7.5, { align: 'center' });
        doc.setTextColor(120, 20, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, margin + 4, y + 14);

        y += cancelH + 10;
    }

    // ═══════════════════════════════════════
    // REPUESTOS VENDIDOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = drawSectionHeader(
        doc, 'REPUESTOS VENDIDOS', y, margin, contentW,
        `${items.length} item${items.length !== 1 ? 's' : ''}`
    );

    doc.autoTable({
        head: [['Repuesto', 'Precio aplicado']],
        body: items.length
            ? items.map(item => [
                item.sparePartName || '—',
                fmt(item.priceApplied)
            ])
            : [['Sin repuestos registrados', '—']],
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            textColor: [60, 60, 60],
            lineColor: [235, 235, 235],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize: 7,
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════
    // ABONOS ACTIVOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = drawSectionHeader(
        doc, 'ABONOS REALIZADOS', y, margin, contentW,
        `${payments.length} abono${payments.length !== 1 ? 's' : ''}`
    );

    doc.autoTable({
        head: [['#', 'Método', 'Registrado por', 'Fecha', 'Monto']],
        body: payments.length
            ? payments
                .sort((a, b) => a.paymentNumber - b.paymentNumber)
                .map(p => [
                    `#${String(p.paymentNumber).padStart(2, '0')}`,
                    p.paymentMethodName || '—',
                    p.employeeName || '—',
                    p.paymentDate || '—',
                    fmt(p.amount)
                ])
            : [['—', 'Sin abonos registrados', '—', '—', '$0.00']],
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            textColor: [60, 60, 60],
            lineColor: [235, 235, 235],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize: 7,
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 16, halign: 'center', textColor: [180, 180, 180] },
            1: { cellWidth: 32 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 26, textColor: [130, 130, 130] },
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 6;

    // ═══════════════════════════════════════
    // RESUMEN FINANCIERO
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 50, pageH, margin, pageW);

    const summaryBoxH = 42;
    doc.setFillColor(22, 22, 22);
    doc.roundedRect(margin, y, contentW, summaryBoxH, 3, 3, 'F');
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, summaryBoxH, 'F');

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN FINANCIERO', margin + 8, y + 8);

    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.3);
    doc.line(margin + 8, y + 11, pageW - margin - 4, y + 11);

    const summaryRows = [
        { label: 'Precio de venta', value: fmt(sale.salePrice),  color: [220, 220, 220] },
        { label: 'Total abonado',   value: fmt(sale.totalPaid),  color: [109, 190, 69]  }
    ];

    summaryRows.forEach((row, i) => {
        const rowY = y + 19 + i * 7;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(row.label, margin + 8, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...row.color);
        doc.text(row.value, pageW - margin - 4, rowY, { align: 'right' });
    });

    const deudaY = y + 33;
    doc.setDrawColor(50, 50, 50);
    doc.line(margin + 8, deudaY - 3, pageW - margin - 4, deudaY - 3);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Deuda pendiente', margin + 8, deudaY + 3);
    doc.setTextColor(hasDebt ? 211 : 109, hasDebt ? 24 : 190, hasDebt ? 19 : 69);
    doc.setFontSize(12);
    doc.text(fmt(sale.amountDue), pageW - margin - 4, deudaY + 3, { align: 'right' });

    y += summaryBoxH + 10;

    // ═══════════════════════════════════════
    // NOTAS
    // ═══════════════════════════════════════
    if (sale.notes?.trim()) {
        y = checkPageBreak(doc, y, 22, pageH, margin, pageW);
        const notasLines = doc.splitTextToSize(sale.notes.trim(), contentW - 12);
        const notasH     = Math.max(18, notasLines.length * 5 + 14);

        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, notasH, 2, 2, 'FD');
        doc.setFillColor(245, 158, 11);
        doc.roundedRect(margin + 4, y + 4, 30, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS DE VENTA', margin + 19, y + 7.5, { align: 'center' });
        doc.setTextColor(100, 80, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(notasLines, margin + 4, y + 14);
    }

    drawFooter(doc, pageW, pageH, margin);
    doc.save(`venta-repuestos-${String(sale.idSparePartsSales).slice(0, 8).toUpperCase()}.pdf`);
};
