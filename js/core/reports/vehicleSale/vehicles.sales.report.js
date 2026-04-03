// js/core/reports/vehicleSale/vehicles.sales.report.js

const urlToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

const loadPhotos = async (photos = [], max = 4) => {
    const slice = photos.slice(0, max);
    const results = await Promise.all(slice.map(p => urlToBase64(p.photoUrl)));
    return results.filter(Boolean);
};

export const generateVehicleSaleReport = async (sale, vehicle, customerName) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    const photos = await loadPhotos(vehicle?.photos || [], 4);
    const hasDebt = Number(sale.amountDue ?? 0) > 0;

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
    doc.text(`Registrado por: ${sale.employeeFullName || '—'}`, margin, 29);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE VENTA', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(`N° ${String(sale.idSale).slice(0, 8).toUpperCase()}`, pageW - margin, 28, { align: 'right' });

    // ═══════════════════════════════════════
    // META — fecha + badge estado
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
    doc.text(
        hasDebt ? 'CON DEUDA' : 'SALDADO',
        pageW - margin - badgeW / 2, y,
        { align: 'center' }
    );

    // Badge estado venta
    const estadoW = 36;
    const estadoColor = sale.nameStateSale === 'Reservado' ? [245, 158, 11] : [46, 125, 50];
    doc.setFillColor(...estadoColor);
    doc.roundedRect(pageW - margin - badgeW - estadoW - 4, y - 5, estadoW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(
        (sale.nameStateSale || '—').toUpperCase(),
        pageW - margin - badgeW - estadoW - 4 + estadoW / 2, y,
        { align: 'center' }
    );

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // DOS COLUMNAS — Cliente | Vehículo
    // ═══════════════════════════════════════
    const colW = (contentW - 6) / 2;
    const col2X = margin + colW + 6;
    const boxH = 44;

    // Col izquierda — Cliente
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
    doc.text(customerName || '—', margin + 4, y + 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Estado: ${sale.nameStateSale || '—'}`, margin + 4, y + 27);
    doc.text(`Fecha venta: ${sale.saleDate || '—'}`, margin + 4, y + 35);

    // Col derecha — Vehículo
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.roundedRect(col2X, y, colW, boxH, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    doc.roundedRect(col2X + 4, y + 4, 24, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('VEHÍCULO', col2X + 16, y + 7.5, { align: 'center' });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`, col2X + 4, y + 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`VIN: ${vehicle.vin || '—'}`, col2X + 4, y + 27);
    doc.text(`Millaje: ${vehicle.mileage || '—'}`, col2X + 4, y + 35);

    y += boxH + 10;

    // ═══════════════════════════════════════
    // GALERÍA DE FOTOS
    // ═══════════════════════════════════════
    if (photos.length > 0) {
        doc.setFillColor(30, 30, 30);
        doc.rect(margin, y, contentW, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('FOTOS DEL VEHÍCULO', margin + 4, y + 6);
        doc.setTextColor(160, 160, 160);
        doc.text(`${photos.length} foto${photos.length !== 1 ? 's' : ''}`, pageW - margin - 4, y + 6, { align: 'right' });

        y += 12;

        const imgW = (contentW - 4) / 2;
        const imgH = imgW * 0.62;
        const gapX = 4;
        const gapY = 4;

        photos.forEach((b64, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = margin + col * (imgW + gapX);
            const iy = y + row * (imgH + gapY);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, iy, imgW, imgH, 2, 2, 'S');
            doc.addImage(b64, 'JPEG', x, iy, imgW, imgH, undefined, 'FAST');
        });

        const photoRows = Math.ceil(photos.length / 2);
        y += photoRows * (imgH + gapY) + 6;
    }

    // ═══════════════════════════════════════
    // TABLA DE ABONOS
    // ═══════════════════════════════════════
    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ABONOS REALIZADOS', margin + 4, y + 6);

    const paymentsCount = sale.payments?.length || 0;
    doc.setTextColor(160, 160, 160);
    doc.text(
        `${paymentsCount} abono${paymentsCount !== 1 ? 's' : ''}`,
        pageW - margin - 4, y + 6,
        { align: 'right' }
    );

    y += 9;

    const tableBody = sale.payments?.length
        ? sale.payments.map((p, i) => [
            `#${String(i + 1).padStart(2, '0')}`,
            p.paymentMethod || '—',
            p.employeeName || '—',
            p.paymentDate || '—',
            `$${Number(p.amount).toFixed(2)}`
        ])
        : [['—', 'Sin abonos registrados', '—', '—', '$0.00']];

    doc.autoTable({
        head: [['#', 'Método', 'Registrado por', 'Fecha', 'Monto']],
        body: tableBody,
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

    // ═══════════════════════════════════════
    // RESUMEN FINANCIERO
    // ═══════════════════════════════════════
    y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Comisión del vendedor:', margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text(`$${Number(sale.commission || 0).toFixed(2)}`, margin + 30, y); // 👈 pegado al label, no al extremo
    y += 10;

    const summaryRows = [
        { label: 'Precio de venta', value: `$${Number(sale.fullTotalCost).toFixed(2)}`, color: [220, 220, 220] },
        { label: 'Total abonado', value: `$${Number(sale.totalPaid || 0).toFixed(2)}`, color: [109, 190, 69] }
    ];

    // summaryBoxH baja de 52 a 44 porque son 3 filas ahora
    const summaryBoxH = 40;
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

    summaryRows.forEach((row, i) => {
        const rowY = y + 19 + i * 7;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(row.label, margin + 8, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...row.color);
        doc.text(row.value, pageW - margin - 4, rowY, { align: 'right' });
    });

    const deudaY = y + 32;
    doc.setDrawColor(50, 50, 50);
    doc.line(margin + 8, deudaY - 3, pageW - margin - 4, deudaY - 3);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Deuda pendiente', margin + 8, deudaY + 3);
    doc.setTextColor(
        hasDebt ? 211 : 109,
        hasDebt ? 24 : 190,
        hasDebt ? 19 : 69
    );
    doc.setFontSize(12);
    doc.text(
        `$${Number(sale.amountDue ?? 0).toFixed(2)}`,
        pageW - margin - 4, deudaY + 3,
        { align: 'right' }
    );

    y += summaryBoxH + 10;

    // ═══════════════════════════════════════
    // NOTAS
    // ═══════════════════════════════════════
    if (sale.notes?.trim()) {
        const notasLines = doc.splitTextToSize(sale.notes.trim(), contentW - 30);
        const notasH = Math.max(18, notasLines.length * 5 + 14);

        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, notasH, 2, 2, 'FD');

        doc.setFillColor(245, 158, 11);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.roundedRect(margin + 4, y + 4, 30, 5, 1, 1, 'F');
        doc.text('Notas de la venta', margin + 19, y + 7.5, { align: 'center' });

        doc.setTextColor(100, 80, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(notasLines, margin + 4, y + 14);
    }

    // ═══════════════════════════════════════
    // PIE DE PÁGINA
    // ═══════════════════════════════════════
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 16, pageW - margin, pageH - 16);

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Leal Import · Documento generado automáticamente', margin, pageH - 10);
    doc.text(
        new Date().toLocaleString('es-SV'),
        pageW - margin, pageH - 10,
        { align: 'right' }
    );

    doc.save(`venta-${String(sale.idSale).slice(0, 8).toUpperCase()}.pdf`);
};
