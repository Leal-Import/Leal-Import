// js/core/reports/vehicles/vehicles.report.js

const urlToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

const loadPhotos = async(photos = [], max = 4) => {
    const results = await Promise.all(
        photos.slice(0, max).map(p => urlToBase64(p.photoUrl))
    );
    return results.filter(Boolean);
};

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

export const generateVehicleReport = async(vehicle) => {
    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF();
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const margin   = 14;
    const contentW = pageW - margin * 2;

    const photos      = await loadPhotos(vehicle.vehiclePhotos || [], 4);
    const isAvailable = vehicle.status === 'Disponible';
    const costs       = vehicle.vehicleCosts;

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
    doc.text(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`, pageW - margin, 28, { align: 'right' });

    // ═══════════════════════════════════════
    // META — fecha + badge
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

    const badgeW = 26;
    doc.setFillColor(...(isAvailable ? [46, 125, 50] : [211, 24, 19]));
    doc.roundedRect(pageW - margin - badgeW, y - 5, badgeW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicle.status?.toUpperCase() || '—', pageW - margin - badgeW / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // 1. GALERÍA DE FOTOS (arriba)
    // ═══════════════════════════════════════
    if (photos.length > 0) {
        const imgW    = (contentW - 4) / 2;
        const imgH    = imgW * 0.62;
        const gapX    = 4;
        const gapY    = 4;
        const rows    = Math.ceil(photos.length / 2);
        const totalH  = 9 + rows * (imgH + gapY);

        y = checkPageBreak(doc, y, totalH, pageH, margin, pageW);

        // Header sección
        doc.setFillColor(30, 30, 30);
        doc.rect(margin, y, contentW, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('FOTOS DEL VEHÍCULO', margin + 4, y + 6);
        doc.setTextColor(160, 160, 160);
        doc.text(
            `${photos.length} foto${photos.length !== 1 ? 's' : ''}`,
            pageW - margin - 4, y + 6, { align: 'right' }
        );

        y += 11;

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
    }

    // ═══════════════════════════════════════
    // 2. DATOS GENERALES + LOTE
    // ═══════════════════════════════════════
    const colW  = (contentW - 6) / 2;
    const col2X = margin + colW + 6;

    const leftRows = [
        { label: 'VIN',             value: vehicle.vin || '—' },
        { label: 'Marca',           value: vehicle.brand || '—' },
        { label: 'Modelo',          value: vehicle.model || '—' },
        { label: 'Año',             value: String(vehicle.year) || '—' },
        { label: 'Kilometraje',     value: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : '—' },
        { label: 'Fecha de compra', value: vehicle.purchaseDate || '—' },
        { label: 'Procedencia',     value: vehicle.source || '—' }
    ];

    const leftBoxH = leftRows.length * 9 + 14;
    y = checkPageBreak(doc, y, leftBoxH, pageH, margin, pageW);

    // Col izquierda — Datos generales
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, colW, leftBoxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, colW, leftBoxH, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    doc.roundedRect(margin + 4, y + 4, 30, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS GENERALES', margin + 19, y + 7.5, { align: 'center' });

    leftRows.forEach((row, i) => {
        const rowY = y + 16 + i * 9;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(row.label, margin + 4, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(row.value, margin + colW - 4, rowY, { align: 'right' });
        if (i < leftRows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(margin + 4, rowY + 3, margin + colW - 4, rowY + 3);
        }
    });

    // Col derecha — Lote
    const loteBoxH = 24;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(col2X, y, colW, loteBoxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(col2X, y, colW, loteBoxH, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    doc.roundedRect(col2X + 4, y + 4, 16, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('LOTE', col2X + 12, y + 7.5, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(vehicle.lot?.numLot || '—', col2X + 4, y + 18);

    // Col derecha — Descripción
    if (vehicle.description?.trim()) {
        const descY     = y + loteBoxH + 4;
        const descLines = doc.splitTextToSize(vehicle.description.trim(), colW - 10);
        const descBoxH  = Math.max(24, descLines.length * 5 + 16);

        doc.setFillColor(250, 250, 250);
        doc.roundedRect(col2X, descY, colW, descBoxH, 3, 3, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(col2X, descY, colW, descBoxH, 3, 3, 'S');

        doc.setFillColor(211, 24, 19);
        doc.roundedRect(col2X + 4, descY + 4, 24, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPCIÓN', col2X + 16, descY + 7.5, { align: 'center' });

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(descLines, col2X + 4, descY + 16);
    }

    y += leftBoxH + 10;

    // ═══════════════════════════════════════
    // 3. COSTOS DE IMPORTACIÓN
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);

    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COSTOS DE IMPORTACIÓN', margin + 4, y + 6);
    y += 9;

    const costRows = [
        ['Factura',  costs?.bill     ?? 0],
        ['Transferencia',  costs?.transfer ?? 0],
        ['Almacenaje',     costs?.storage  ?? 0],
        ['Grúa',           costs?.towTruck ?? 0],
        ['Barco',   costs?.ship     ?? 0],
        ['Impuestos',      costs?.taxes    ?? 0],
        ['IVA',            costs?.iva      ?? 0],
        ['PA',             costs?.pa       ?? 0]
    ];

    doc.autoTable({
        head: [['Concepto', 'Monto']],
        body: costRows.map(([label, val]) => [label, `$${Number(val).toFixed(2)}`]),
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            textColor:  [60, 60, 60],
            lineColor:  [235, 235, 235],
            lineWidth:  0.3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [130, 130, 130],
            fontStyle: 'bold',
            fontSize:  7.5,
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

    // Total + precio sugerido
    doc.setFillColor(22, 22, 22);
    doc.roundedRect(margin, y, contentW, 30, 0, 0, 'F');
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, 30, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 140);
    doc.text('Costo total de importación', margin + 8, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 220, 220);
    doc.text(`$${Number(costs?.total ?? 0).toFixed(2)}`, pageW - margin - 4, y + 9, { align: 'right' });

    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.3);
    doc.line(margin + 8, y + 13, pageW - margin - 4, y + 13);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Precio sugerido de venta', margin + 8, y + 24);
    doc.setTextColor(109, 190, 69);
    doc.setFontSize(12);
    doc.text(`$${Number(costs?.suggestedPrice ?? 0).toFixed(2)}`, pageW - margin - 4, y + 24, { align: 'right' });

    y += 34;

    // ═══════════════════════════════════════
    // PIE DE PÁGINA
    // ═══════════════════════════════════════
    drawFooter(doc, pageW, pageH, margin);

    doc.save(`vehiculo-${vehicle.brand}-${vehicle.model}-${vehicle.year}.pdf`);
};
