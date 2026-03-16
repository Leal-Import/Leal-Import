// js/core/reports/spareparts/spare.parts.report.js

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

export const generateSparePartReport = async(sparePart) => {
    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF();
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const margin   = 14;
    const contentW = pageW - margin * 2;

    const costs     = sparePart.sparePartsCosts;
    const isSold    = sparePart.status === 'Vendido';
    const isDelivered = sparePart.state === 'Entregado';

    // Cargar foto del repuesto
    const photo = sparePart.photoUrl ? await urlToBase64(sparePart.photoUrl) : null;

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
    doc.text('FICHA DE REPUESTO', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(sparePart.nameSpareParts?.trim() || '—', pageW - margin, 28, { align: 'right' });

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

    // Badge estado inventario
    const badge1W = 22;
    const badge2W = 24;
    doc.setFillColor(...(isSold ? [211, 24, 19] : [46, 125, 50]));
    doc.roundedRect(pageW - margin - badge1W, y - 5, badge1W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(sparePart.status?.toUpperCase() || '—', pageW - margin - badge1W / 2, y, { align: 'center' });

    // Badge estado de orden
    doc.setFillColor(...(isDelivered ? [46, 125, 50] : [245, 158, 11]));
    doc.roundedRect(pageW - margin - badge1W - badge2W - 4, y - 5, badge2W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(sparePart.state?.toUpperCase() || '—', pageW - margin - badge1W - badge2W - 4 + badge2W / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // 1. FOTO + DATOS GENERALES (lado a lado)
    // ═══════════════════════════════════════
    const colW  = (contentW - 6) / 2;
    const col2X = margin + colW + 6;

    // Foto a la izquierda
    if (photo) {
        const imgH = colW * 0.75;
        y = checkPageBreak(doc, y, imgH, pageH, margin, pageW);

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, colW, imgH, 3, 3, 'S');
        doc.addImage(photo, 'JPEG', margin, y, colW, imgH, undefined, 'FAST');

        // Datos a la derecha
        const dataRows = [
            { label: 'Nombre',   value: sparePart.nameSpareParts?.trim() || '—' },
            { label: 'Marca',    value: sparePart.brand    || '—' },
            { label: 'Modelo',   value: sparePart.model    || '—' },
            { label: 'Año',      value: sparePart.yearPart || '—' }
        ];

        const dataBoxH = imgH;
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(col2X, y, colW, dataBoxH, 3, 3, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(col2X, y, colW, dataBoxH, 3, 3, 'S');

        doc.setFillColor(211, 24, 19);
        doc.roundedRect(col2X + 4, y + 4, 30, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS GENERALES', col2X + 19, y + 7.5, { align: 'center' });

        dataRows.forEach((row, i) => {
            const rowY = y + 18 + i * 10;
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(130, 130, 130);
            doc.text(row.label, col2X + 4, rowY);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            // Truncar si es muy largo
            const val = doc.splitTextToSize(row.value, colW - 10)[0];
            doc.text(val, col2X + colW - 4, rowY, { align: 'right' });
            if (i < dataRows.length - 1) {
                doc.setDrawColor(240, 240, 240);
                doc.setLineWidth(0.2);
                doc.line(col2X + 4, rowY + 3, col2X + colW - 4, rowY + 3);
            }
        });

        y += imgH + 10;

    } else {
        // Sin foto — datos a full ancho
        const dataRows = [
            { label: 'Nombre',   value: sparePart.nameSpareParts?.trim() || '—' },
            { label: 'Marca',    value: sparePart.brand    || '—' },
            { label: 'Modelo',   value: sparePart.model    || '—' },
            { label: 'Año',      value: sparePart.yearPart || '—' }
        ];

        const boxH = dataRows.length * 9 + 14;
        y = checkPageBreak(doc, y, boxH, pageH, margin, pageW);

        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'S');

        doc.setFillColor(211, 24, 19);
        doc.roundedRect(margin + 4, y + 4, 30, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS GENERALES', margin + 19, y + 7.5, { align: 'center' });

        dataRows.forEach((row, i) => {
            const rowY = y + 16 + i * 9;
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(130, 130, 130);
            doc.text(row.label, margin + 4, rowY);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(row.value, pageW - margin - 4, rowY, { align: 'right' });
            if (i < dataRows.length - 1) {
                doc.setDrawColor(240, 240, 240);
                doc.setLineWidth(0.2);
                doc.line(margin + 4, rowY + 3, pageW - margin - 4, rowY + 3);
            }
        });

        y += boxH + 10;
    }

    // ═══════════════════════════════════════
    // 2. TRACKING
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 30, pageH, margin, pageW);

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'S');

    doc.setFillColor(211, 24, 19);
    doc.roundedRect(margin + 4, y + 4, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('TRACKING', margin + 14, y + 7.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text('Número de tracking:', margin + 4, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(sparePart.tracking?.numTracking || 'Sin tracking', margin + 44, y + 18);

    if (sparePart.tracking?.linkTracking) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(59, 130, 246);
        doc.text(sparePart.tracking.linkTracking, margin + 4, y + 25);
    }

    y += 36;

    // ═══════════════════════════════════════
    // 3. COSTOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);

    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COSTOS', margin + 4, y + 6);
    y += 9;

    doc.autoTable({
        head: [['Concepto', 'Monto']],
        body: [
            ['Precio de compra', `$${Number(costs?.purchasePrice ?? 0).toFixed(2)}`],
            ['Impuestos',        `$${Number(costs?.taxes        ?? 0).toFixed(2)}`]
        ],
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
    doc.text('Costo total', margin + 8, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 220, 220);
    doc.text(`$${Number(costs?.totalCost ?? 0).toFixed(2)}`, pageW - margin - 4, y + 9, { align: 'right' });

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

    doc.save(`repuesto-${sparePart.nameSpareParts?.trim().replace(/\s+/g, '-') || sparePart.idSparePart}.pdf`);
};
