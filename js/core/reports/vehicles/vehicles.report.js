// js/core/reports/vehicles/vehicles.report.js

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
    const results = await Promise.all(
        photos.slice(0, max).map(p => urlToBase64(p.photoUrl))
    );
    return results.filter(Boolean);
};

const fmt = (val) => `$${Number(val ?? 0).toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const sourceLabel = (source) => ({
    INVENTORY: 'Inventario propio',
    EXTERNAL: 'Vehículo externo'
})[source] ?? source ?? '—';

const statusColor = (status) => ({
    'Disponible':           [46, 125, 50],
    'Vendido':              [211, 24, 19],
    'En reparación':        [230, 120, 0],
    'Espera de aprobación': [100, 100, 200]
})[status] ?? [100, 100, 100];

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

const drawInfoBox = (doc, rows, x, y, w, title) => {
    const rowH  = 9;
    const boxH  = rows.length * rowH + 16;

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, y, w, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, boxH, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    const tagW = title.length * 2.2 + 6;
    doc.roundedRect(x + 4, y + 4, tagW, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 4 + tagW / 2, y + 7.5, { align: 'center' });

    rows.forEach((row, i) => {
        const rowY = y + 16 + i * rowH;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(row.label, x + 4, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        const val = doc.splitTextToSize(String(row.value ?? '—'), w - 8)[0];
        doc.text(val, x + w - 4, rowY, { align: 'right' });
        if (i < rows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(x + 4, rowY + 3, x + w - 4, rowY + 3);
        }
    });

    return y + boxH;
};

export const generateVehicleReport = async (vehicle) => {
    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF();
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const margin   = 14;
    const contentW = pageW - margin * 2;
    const costs    = vehicle.vehicleCosts;
    const hasCosts = !!costs;
    const isExternal = vehicle.source === 'EXTERNAL';

    const photos = await loadPhotos(vehicle.vehiclePhotos || [], 4);

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
    doc.text('FICHA DE VEHÍCULO', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(`${vehicle.brand} ${vehicle.model} · ${vehicle.year}`, pageW - margin, 28, { align: 'right' });

    // ═══════════════════════════════════════
    // META — fecha + badge status + badge source
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

    // Badge status
    const badgeW = 28;
    const [r, g, b] = statusColor(vehicle.status);
    doc.setFillColor(r, g, b);
    doc.roundedRect(pageW - margin - badgeW, y - 5, badgeW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicle.status?.toUpperCase() || '—', pageW - margin - badgeW / 2, y, { align: 'center' });

    // Badge source
    const srcLabel = sourceLabel(vehicle.source);
    const srcBadgeW = srcLabel.length * 1.8 + 6;
    doc.setFillColor(isExternal ? 100 : 30, isExternal ? 100 : 100, isExternal ? 200 : 30);
    doc.roundedRect(pageW - margin - badgeW - srcBadgeW - 4, y - 5, srcBadgeW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(srcLabel.toUpperCase(), pageW - margin - badgeW - srcBadgeW - 4 + srcBadgeW / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // GALERÍA DE FOTOS
    // ═══════════════════════════════════════
    if (photos.length > 0) {
        const imgW   = (contentW - 4) / 2;
        const imgH   = imgW * 0.62;
        const gapX   = 4;
        const gapY   = 4;
        const rows   = Math.ceil(photos.length / 2);
        const totalH = 9 + rows * (imgH + gapY);

        y = checkPageBreak(doc, y, totalH, pageH, margin, pageW);
        y = drawSectionHeader(doc, 'FOTOS DEL VEHÍCULO', y, margin, contentW, `${photos.length} foto${photos.length !== 1 ? 's' : ''}`);
        y += 2;

        photos.forEach((b64, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x   = margin + col * (imgW + gapX);
            const iy  = y + row * (imgH + gapY);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, iy, imgW, imgH, 2, 2, 'S');
            doc.addImage(b64, 'JPEG', x, iy, imgW, imgH, undefined, 'FAST');
        });

        y += rows * (imgH + gapY) + 10;
    } else {
        y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
        y = drawSectionHeader(doc, 'FOTOS DEL VEHÍCULO', y, margin, contentW, 'Sin fotos');
        y += 2;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(180, 180, 180);
        doc.text('No hay fotos disponibles para este vehículo.', margin + 4, y + 8);
        y += 18;
    }

    // ═══════════════════════════════════════
    // DATOS GENERALES + PROPIETARIO / LOTE
    // ═══════════════════════════════════════
    const colW  = (contentW - 6) / 2;
    const col2X = margin + colW + 6;

    const generalRows = [
        { label: 'VIN',             value: vehicle.vin },
        { label: 'Marca',           value: vehicle.brand },
        { label: 'Modelo',          value: vehicle.model },
        { label: 'Año',             value: vehicle.year },
        { label: 'Kilometraje',     value: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : '—' },
        { label: 'Fecha de compra', value: vehicle.purchaseDate },
        { label: 'Procedencia',     value: sourceLabel(vehicle.source) }
    ];

    const leftBoxH = generalRows.length * 9 + 16;
    y = checkPageBreak(doc, y, leftBoxH + 12, pageH, margin, pageW);

    y = drawSectionHeader(doc, 'INFORMACIÓN DEL VEHÍCULO', y, margin, contentW);
    y += 4;

    const leftEndY = drawInfoBox(doc, generalRows, margin, y, colW, 'DATOS GENERALES', margin);

    // Col derecha — propietario (si es externo) + lote
    let rightY = y;

    if (isExternal && vehicle.customerName) {
        const ownerRows = [{ label: 'Propietario', value: vehicle.customerName }];
        const ownerBoxH = ownerRows.length * 9 + 16;
        doc.setFillColor(250, 245, 255);
        doc.roundedRect(col2X, rightY, colW, ownerBoxH, 3, 3, 'F');
        doc.setDrawColor(200, 180, 240);
        doc.roundedRect(col2X, rightY, colW, ownerBoxH, 3, 3, 'S');
        drawInfoBox(doc, ownerRows, col2X, rightY, colW, 'PROPIETARIO', margin);
        rightY += ownerBoxH + 4;
    }

    const loteRows = [
        { label: 'Número de lote', value: vehicle.lot?.numLot },
        { label: 'Link',           value: vehicle.lot?.linkLot }
    ];
    drawInfoBox(doc, loteRows, col2X, rightY, colW, 'LOTE', margin);

    y = Math.max(leftEndY, rightY + loteRows.length * 9 + 16) + 10;

    // Descripción
    if (vehicle.description?.trim()) {
        y = checkPageBreak(doc, y, 30, pageH, margin, pageW);
        const descLines = doc.splitTextToSize(vehicle.description.trim(), contentW - 10);
        const descBoxH  = Math.max(20, descLines.length * 5 + 16);

        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentW, descBoxH, 3, 3, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(margin, y, contentW, descBoxH, 3, 3, 'S');

        doc.setFillColor(211, 24, 19);
        doc.roundedRect(margin + 4, y + 4, 24, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPCIÓN', margin + 16, y + 7.5, { align: 'center' });

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(descLines, margin + 4, y + 16);

        y += descBoxH + 10;
    }

    // ═══════════════════════════════════════
    // COSTOS DE IMPORTACIÓN (solo si existen)
    // ═══════════════════════════════════════
    if (hasCosts) {
        y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
        y = drawSectionHeader(doc, 'COSTOS DE IMPORTACIÓN', y, margin, contentW);

        const costRows = [
            ['Factura',       costs.bill],
            ['Transferencia', costs.transfer],
            ['Almacenaje',    costs.storage],
            ['Grúa',          costs.towTruck],
            ['Barco',         costs.ship],
            ['Impuestos',     costs.taxes],
            ['IVA',           costs.iva],
            ['PA',            costs.pa]
        ].filter(([, val]) => val !== null && val !== 0);

        doc.autoTable({
            head: [['Concepto', 'Monto']],
            body: costRows.map(([label, val]) => [label, fmt(val)]),
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'plain',
            styles: {
                fontSize: 9,
                cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
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
                0: { cellWidth: 'auto' },
                1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
            },
            alternateRowStyles: { fillColor: [252, 252, 252] }
        });

        y = doc.lastAutoTable.finalY;
        y = checkPageBreak(doc, y, 34, pageH, margin, pageW);

        // Totales
        doc.setFillColor(22, 22, 22);
        doc.roundedRect(margin, y, contentW, 32, 0, 0, 'F');
        doc.setFillColor(211, 24, 19);
        doc.rect(margin, y, 3, 32, 'F');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text('Costo total de importación', margin + 8, y + 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 220, 220);
        doc.text(fmt(costs.total), pageW - margin - 4, y + 10, { align: 'right' });

        doc.setDrawColor(50, 50, 50);
        doc.setLineWidth(0.3);
        doc.line(margin + 8, y + 14, pageW - margin - 4, y + 14);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 180, 180);
        doc.text('Precio sugerido de venta', margin + 8, y + 26);
        doc.setTextColor(109, 190, 69);
        doc.setFontSize(12);
        doc.text(fmt(costs.suggestedPrice), pageW - margin - 4, y + 26, { align: 'right' });

        y += 34;
    } else {
        // Banner informativo si es externo sin costos
        y = checkPageBreak(doc, y, 18, pageH, margin, pageW);
        doc.setFillColor(245, 245, 200);
        doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');
        doc.setDrawColor(200, 190, 100);
        doc.roundedRect(margin, y, contentW, 14, 3, 3, 'S');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 100, 0);
        doc.text('Este vehículo no tiene costos de importación registrados.', margin + 6, y + 9);
        y += 20;
    }

    drawFooter(doc, pageW, pageH, margin);
    doc.save(`vehiculo-${vehicle.brand}-${vehicle.model}-${vehicle.year}.pdf`);
};
