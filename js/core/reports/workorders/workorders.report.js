// js/core/reports/workorders/work.order.report.js

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

const sectionHeader = (doc, y, contentW, margin, pageW, title, sub = '') => {
    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, y + 6);
    if (sub) {
        doc.setTextColor(160, 160, 160);
        doc.text(sub, pageW - margin - 4, y + 6, { align: 'right' });
    }
    return y + 9;
};

export const generateWorkOrderReport = (order) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    const isCompleted = order.status === 'Completada';
    const isPaid = order.paymentStatus === 'Pagado';
    const hasDebt = Number(order.amountDue) > 0;

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

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text('Importadora de vehículos', margin, 29);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE TRABAJO', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(`${order.vehicleInfo.brand} ${order.vehicleInfo.model} ${order.vehicleInfo.year}`, pageW - margin, 28, { align: 'right' });

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

    // Badge estado orden
    const b1W = 28;
    const b1Color = isCompleted ? [46, 125, 50] : [211, 24, 19];
    doc.setFillColor(...b1Color);
    doc.roundedRect(pageW - margin - b1W, y - 5, b1W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(order.status?.toUpperCase() || '—', pageW - margin - b1W / 2, y, { align: 'center' });

    // Badge pago
    const b2W = 24;
    const b2Color = isPaid ? [46, 125, 50] : hasDebt ? [211, 24, 19] : [245, 158, 11];
    doc.setFillColor(...b2Color);
    doc.roundedRect(pageW - margin - b1W - b2W - 4, y - 5, b2W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(order.paymentStatus?.toUpperCase() || '—', pageW - margin - b1W - b2W - 4 + b2W / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // DOS COLUMNAS — Vehículo | Orden & Mecánico
    // ═══════════════════════════════════════
    const colW = (contentW - 6) / 2;
    const col2X = margin + colW + 6;
    const boxH = 46;

    y = checkPageBreak(doc, y, boxH, pageH, margin, pageW);

    // Col izquierda — Vehículo
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
    doc.text('VEHÍCULO', margin + 15, y + 7.5, { align: 'center' });

    const vehicleRows = [
        { label: 'Marca / Modelo', value: `${order.vehicleInfo.brand} ${order.vehicleInfo.model}` },
        { label: 'Año', value: String(order.vehicleInfo.year) },
        { label: 'VIN', value: order.vehicleInfo.vin || '—' }
    ];

    vehicleRows.forEach((row, i) => {
        const rowY = y + 17 + i * 9;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(row.label, margin + 4, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(row.value, margin + colW - 4, rowY, { align: 'right' });
        if (i < vehicleRows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(margin + 4, rowY + 3, margin + colW - 4, rowY + 3);
        }
    });

    // Col derecha — Fechas y mecánico
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    doc.roundedRect(col2X + 4, y + 4, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN', col2X + 14, y + 7.5, { align: 'center' });

    const orderRows = [
        { label: 'Fecha de orden', value: order.workOrderDate || '—' },
        { label: 'Fecha estimada', value: order.estimatedDate || '—' },
        { label: 'Mecánico a cargo', value: order.workOrdersPayments?.[0]?.employeeName || '—' }
    ];

    orderRows.forEach((row, i) => {
        const rowY = y + 17 + i * 9;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(row.label, col2X + 4, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(row.value, col2X + colW - 4, rowY, { align: 'right' });
        if (i < orderRows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(col2X + 4, rowY + 3, col2X + colW - 4, rowY + 3);
        }
    });

    y += boxH + 10;

    // ═══════════════════════════════════════
    // SERVICIOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'SERVICIOS REALIZADOS',
        `${order.workOrdersServices?.length || 0} servicio${order.workOrdersServices?.length !== 1 ? 's' : ''}`
    );

    const servicesBody = order.workOrdersServices?.length
        ? order.workOrdersServices.map((s, i) => [
            `#${String(i + 1).padStart(2, '0')}`,
            s.serviceName || '—',
            s.assignedEmployee || '—',
            `$${Number(s.priceApplied).toFixed(2)}`
        ])
        : [['—', 'Sin servicios registrados', '—', '$0.00']];

    doc.autoTable({
        head: [['#', 'Servicio', 'Asignado a', 'Precio']],
        body: servicesBody,
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            textColor: [60, 60, 60],
            lineColor: [235, 235, 235],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize: 7.5,
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 14, halign: 'center', textColor: [180, 180, 180] },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 52, textColor: [100, 100, 100] },
            3: { cellWidth: 36, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════
    // REPUESTOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'REPUESTOS UTILIZADOS',
        `${order.workOrdersSpareParts?.length || 0} repuesto${order.workOrdersSpareParts?.length !== 1 ? 's' : ''}`
    );

    const spareBody = order.workOrdersSpareParts?.length
        ? order.workOrdersSpareParts.map((p, i) => [
            `#${String(i + 1).padStart(2, '0')}`,
            p.sparePartName || '—',
            p.assignedEmployee || '—',
            `$${Number(p.priceApplied).toFixed(2)}`
        ])
        : [['—', 'Sin repuestos registrados', '—', '$0.00']];

    doc.autoTable({
        head: [['#', 'Repuesto', 'Asignado a', 'Precio']],
        body: spareBody,
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            textColor: [60, 60, 60],
            lineColor: [235, 235, 235],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize: 7.5,
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 14, halign: 'center', textColor: [180, 180, 180] },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 52, textColor: [100, 100, 100] },
            3: { cellWidth: 36, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════
    // ABONOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'ABONOS REALIZADOS',
        `${order.workOrdersPayments?.length || 0} abono${order.workOrdersPayments?.length !== 1 ? 's' : ''}`
    );

    const paymentsBody = order.workOrdersPayments?.length
        ? order.workOrdersPayments.map(p => [
            `#${p.paymentNumber}`,
            p.paymentMethodName || '—',
            p.employeeName || '—',
            p.paymentDate || '—',
            `$${Number(p.amount).toFixed(2)}`
        ])
        : [['—', '—', 'Sin abonos registrados', '—', '$0.00']];

    doc.autoTable({
        head: [['#', 'Método', 'Registrado por', 'Fecha', 'Monto']],
        body: paymentsBody,
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            textColor: [60, 60, 60],
            lineColor: [235, 235, 235],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize: 7.5,
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 14, halign: 'center', textColor: [180, 180, 180] },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 26, halign: 'center', textColor: [130, 130, 130] },
            4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════
    // RESUMEN FINANCIERO
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 50, pageH, margin, pageW);

    const totalServices = order.workOrdersServices?.reduce((a, s) => a + Number(s.priceApplied), 0) ?? 0;
    const totalSpareParts = order.workOrdersSpareParts?.reduce((a, p) => a + Number(p.priceApplied), 0) ?? 0;
    const totalPaid = order.workOrdersPayments?.reduce((a, p) => a + Number(p.amount), 0) ?? 0;

    doc.setFillColor(22, 22, 22);
    doc.roundedRect(margin, y, contentW, 52, 3, 3, 'F');
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, 52, 'F');

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN FINANCIERO', margin + 8, y + 8);

    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.3);
    doc.line(margin + 8, y + 11, pageW - margin - 4, y + 11);

    const finRows = [
        { label: 'Total servicios', value: `$${totalServices.toFixed(2)}`, color: [220, 220, 220] },
        { label: 'Total repuestos', value: `$${totalSpareParts.toFixed(2)}`, color: [220, 220, 220] },
        { label: 'Costo de reparación', value: `$${Number(order.repairCost).toFixed(2)}`, color: [220, 220, 220] },
        { label: 'Total abonado', value: `$${totalPaid.toFixed(2)}`, color: [109, 190, 69] }
    ];

    finRows.forEach((row, i) => {
        const rowY = y + 19 + i * 7;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(row.label, margin + 8, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...row.color);
        doc.text(row.value, pageW - margin - 4, rowY, { align: 'right' });
    });

    // Deuda pendiente
    const deudaY = y + 44;
    doc.setDrawColor(50, 50, 50);
    doc.line(margin + 8, deudaY - 3, pageW - margin - 4, deudaY - 3);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Deuda pendiente', margin + 8, deudaY + 3);
    doc.setTextColor(hasDebt ? 211 : 109, hasDebt ? 24 : 190, hasDebt ? 19 : 69);
    doc.setFontSize(12);
    doc.text(`$${Number(order.amountDue).toFixed(2)}`, pageW - margin - 4, deudaY + 3, { align: 'right' });

    y += 52 + 10;

    // ═══════════════════════════════════════
    // NOTAS
    // ═══════════════════════════════════════
    if (order.notes?.trim()) {
        y = checkPageBreak(doc, y, 24, pageH, margin, pageW);

        const notasLines = doc.splitTextToSize(order.notes.trim(), contentW - 30);
        const notasH = Math.max(20, notasLines.length * 5 + 16);

        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, notasH, 2, 2, 'FD');

        doc.setFillColor(245, 158, 11);
        doc.roundedRect(margin + 4, y + 4, 38, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS DE LA ORDEN', margin + 23, y + 7.5, { align: 'center' });

        doc.setTextColor(100, 80, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(notasLines, margin + 4, y + 16);
    }

    // ═══════════════════════════════════════
    // PIE DE PÁGINA
    // ═══════════════════════════════════════
    drawFooter(doc, pageW, pageH, margin);

    doc.save(`orden-${order.idWorkOrder.slice(0, 8)}.pdf`);
};
