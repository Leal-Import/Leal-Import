// js/core/reports/workorders/work.order.report.js

const urlToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve({
                data: canvas.toDataURL('image/jpeg', 0.92),
                w: img.width,
                h: img.height
            });
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

const fmt = (val) =>
    `$${Number(val ?? 0).toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const stageLabel = (stage) => ({ BEFORE: 'Antes', DURING: 'Durante', AFTER: 'Después' })[stage] ?? stage ?? '—';
const stageColor = (stage) => ({ BEFORE: [245, 158, 11], DURING: [59, 130, 246], AFTER: [46, 125, 50] })[stage] ?? [150, 150, 150];
const STAGE_ORDER = { BEFORE: 0, DURING: 1, AFTER: 2 };

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
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 7, y + 6);
    if (sub) {
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(7);
        doc.text(sub, pageW - margin - 4, y + 6, { align: 'right' });
    }
    return y + 9;
};

const drawInfoBox = (doc, rows, x, y, w, title) => {
    const rowH = 9;
    const boxH = rows.length * rowH + 16;

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, y, w, boxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, boxH, 3, 3, 'S');

    const tagW = title.length * 2.2 + 6;
    doc.setFillColor(211, 24, 19);
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
        const val = doc.splitTextToSize(String(row.value ?? '—'), w - 10)[0];
        doc.text(val, x + w - 4, rowY, { align: 'right' });
        if (i < rows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(x + 4, rowY + 3, x + w - 4, rowY + 3);
        }
    });

    return y + boxH;
};

const loadServicePhotos = async (photos = []) => {
    const sorted = [...photos].sort(
        (a, b) => (STAGE_ORDER[a.imageStage] ?? 99) - (STAGE_ORDER[b.imageStage] ?? 99)
    );
    const results = await Promise.all(
        sorted.map(async (p) => {
            const result = await urlToBase64(p.photoUrl);
            if (!result) return null;
            return {
                b64: result.data,
                naturalW: result.w,
                naturalH: result.h,
                stage: p.imageStage
            };
        })
    );
    return results.filter(Boolean);
};

/**
 * Dibuja fotos de un servicio agrupadas por etapa.
 * Cada etapa (BEFORE, DURING, AFTER) tiene max 3 fotos en una fila.
 * Un badge del color de la etapa se pone debajo de cada fila.
 */
const drawServicePhotos = (doc, photos, y, contentW, margin, pageH, pageW) => {
    if (!photos.length) return y;

    const gap    = 4;
    const badgeH = 8;
    const MAX_H  = 60;

    // Agrupar por etapa
    const groups = {};
    photos.forEach(p => {
        if (!groups[p.stage]) groups[p.stage] = [];
        groups[p.stage].push(p);
    });

    const stageKeys = Object.keys(groups).sort(
        (a, b) => (STAGE_ORDER[a] ?? 99) - (STAGE_ORDER[b] ?? 99)
    );

    for (const stage of stageKeys) {
        const stagePics = groups[stage];
        const cols      = Math.min(stagePics.length, 3);
        const MAX_W     = stagePics.length === 1
            ? contentW * 0.38
            : (contentW - (cols - 1) * gap) / cols;

        const sized = stagePics.map(p => {
            const ratio = p.naturalH / p.naturalW;
            let imgW = MAX_W;
            let imgH = imgW * ratio;
            if (imgH > MAX_H) { imgH = MAX_H; imgW = imgH / ratio; }
            return { ...p, imgW, imgH };
        });

        const rowMaxH = Math.max(...sized.map(p => p.imgH));

        y = checkPageBreak(doc, y, rowMaxH + gap + badgeH + 6, pageH, margin, pageW);

        sized.forEach((p, i) => {
            const colX = stagePics.length === 1
                ? margin + (contentW - p.imgW) / 2
                : margin + i * (MAX_W + gap) + (MAX_W - p.imgW) / 2;

            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.roundedRect(colX, y, p.imgW, p.imgH, 2, 2, 'S');
            doc.addImage(p.b64, 'JPEG', colX, y, p.imgW, p.imgH, undefined, 'NONE');
        });

        // Badge unificado por etapa
        const [br, bg, bb] = stageColor(stage);
        const badgeY = y + rowMaxH + gap;
        const totalW = stagePics.length === 1 ? sized[0].imgW : cols * MAX_W + (cols - 1) * gap;
        const badgeX = stagePics.length === 1 ? margin + (contentW - sized[0].imgW) / 2 : margin;

        doc.setFillColor(br, bg, bb);
        doc.roundedRect(badgeX, badgeY, totalW, badgeH, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(stageLabel(stage), badgeX + totalW / 2, badgeY + 5.5, { align: 'center' });

        y += rowMaxH + gap + badgeH + 6;
    }

    return y;
};

export const generateWorkOrderReport = async (order) => {
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    const pageW     = doc.internal.pageSize.getWidth();
    const pageH     = doc.internal.pageSize.getHeight();
    const margin    = 14;
    const contentW  = pageW - margin * 2;

    const isCompleted = order.status === 'Completada';
    const isCancelled = !!order.cancellationReason;
    const hasDebt     = Number(order.amountDue ?? 0) > 0;

    const paymentStatusColor = {
        'PAGADO':    [46, 125, 50],
        'PARCIAL':   [245, 158, 11],
        'PENDIENTE': [211, 24, 19]
    }[order.paymentStatus?.toUpperCase()] ?? [150, 150, 150];

    const statusColor = isCompleted ? [46, 125, 50] : isCancelled ? [100, 100, 100] : [211, 24, 19];

    const activePayments    = (order.workOrdersPayments || []).filter(p => !p.isCancelled);
    const cancelledPayments = (order.workOrdersPayments || []).filter(p => p.isCancelled);
    const totalPaid         = activePayments.reduce((a, p) => a + Number(p.amount ?? 0), 0);

    // Precargar fotos
    const servicePhotosMap = {};
    for (const s of order.workOrdersServices || []) {
        if (s.photos?.length) {
            servicePhotosMap[s.idWorkOrderService] = await loadServicePhotos(s.photos);
        }
    }

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
    doc.text(`${order.vehicleInfo.brand} ${order.vehicleInfo.model} · ${order.vehicleInfo.year}`, pageW - margin, 28, { align: 'right' });

    // ═══════════════════════════════════════
    // META
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

    const b1W = 30;
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageW - margin - b1W, y - 5, b1W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(order.status?.toUpperCase() || '—', pageW - margin - b1W / 2, y, { align: 'center' });

    const b2W = 28;
    doc.setFillColor(...paymentStatusColor);
    doc.roundedRect(pageW - margin - b1W - b2W - 4, y - 5, b2W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(order.paymentStatus?.toUpperCase() || '—', pageW - margin - b1W - b2W - 4 + b2W / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // RAZÓN DE CANCELACIÓN
    // ═══════════════════════════════════════
    if (order.cancellationReason?.trim()) {
        y = checkPageBreak(doc, y, 22, pageH, margin, pageW);
        const lines   = doc.splitTextToSize(order.cancellationReason.trim(), contentW - 12);
        const cancelH = Math.max(18, lines.length * 5 + 14);

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
    // DOS COLUMNAS — Vehículo | Orden
    // ═══════════════════════════════════════
    const colW  = (contentW - 6) / 2;
    const col2X = margin + colW + 6;

    const vehicleRows = [
        { label: 'VIN',            value: order.vehicleInfo.vin },
        { label: 'Marca / Modelo', value: `${order.vehicleInfo.brand} ${order.vehicleInfo.model}` },
        { label: 'Año',            value: order.vehicleInfo.year }
    ];
    const orderRows = [
        { label: 'Fecha de orden',  value: order.workOrderDate },
        { label: 'Fecha estimada',  value: order.estimatedDate },
        { label: 'Fecha de cierre', value: order.closureDate || 'Sin cerrar' }
    ];

    const colsH = Math.max(vehicleRows.length * 9 + 16, orderRows.length * 9 + 16);

    y = checkPageBreak(doc, y, colsH + 12, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW, 'INFORMACIÓN DE LA ORDEN');
    y += 4;

    drawInfoBox(doc, vehicleRows, margin, y, colW, 'VEHÍCULO');
    drawInfoBox(doc, orderRows,   col2X,  y, colW, 'ORDEN');

    y += colsH + 10;

    // ═══════════════════════════════════════
    // SERVICIOS — cada uno con sus fotos inline
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'SERVICIOS REALIZADOS',
        `${order.workOrdersServices?.length || 0} servicio${order.workOrdersServices?.length !== 1 ? 's' : ''}`
    );
    y += 4;

    if (!order.workOrdersServices?.length) {
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentW, 16, 2, 2, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(margin, y, contentW, 16, 2, 2, 'S');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(180, 180, 180);
        doc.text('Sin servicios registrados.', pageW / 2, y + 10, { align: 'center' });
        y += 24;
    } else {
        for (let idx = 0; idx < order.workOrdersServices.length; idx++) {
            const s      = order.workOrdersServices[idx];
            const photos = servicePhotosMap[s.idWorkOrderService] || [];

            y = checkPageBreak(doc, y, 28, pageH, margin, pageW);

            // Fila del servicio
            const rowH = 22;
            doc.setFillColor(idx % 2 === 0 ? 252 : 248, idx % 2 === 0 ? 252 : 248, idx % 2 === 0 ? 252 : 248);
            doc.roundedRect(margin, y, contentW, rowH, 2, 2, 'F');
            doc.setDrawColor(235, 235, 235);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, y, contentW, rowH, 2, 2, 'S');

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(180, 180, 180);
            doc.text(`#${String(idx + 1).padStart(2, '0')}`, margin + 4, y + 13);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(s.serviceName || '—', margin + 18, y + 9);

            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(s.assignedEmployee || '—', margin + 18, y + 17);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(fmt(s.priceApplied), pageW - margin - 4, y + 13, { align: 'right' });

            // Badge de fotos
            if (photos.length > 0) {
                const pbW = 22;
                const pbX = pageW - margin - 4 - 36 - pbW - 4;
                doc.setFillColor(46, 125, 50);
                doc.roundedRect(pbX, y + 5, pbW, 7, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'bold');
                doc.text(`${photos.length} foto${photos.length !== 1 ? 's' : ''}`, pbX + pbW / 2, y + 10, { align: 'center' });
            }

            y += rowH + 6;

            // Fotos del servicio agrupadas por etapa
            if (photos.length) {
                y = drawServicePhotos(doc, photos, y, contentW, margin, pageH, pageW);
                y += 4;
            }

            // Separador entre servicios
            if (idx < order.workOrdersServices.length - 1) {
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.2);
                doc.line(margin, y, pageW - margin, y);
                y += 8;
            }
        }
    }

    y += 6;

    // ═══════════════════════════════════════
    // REPUESTOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'REPUESTOS UTILIZADOS',
        `${order.workOrdersSpareParts?.length || 0} repuesto${order.workOrdersSpareParts?.length !== 1 ? 's' : ''}`
    );

    doc.autoTable({
        head: [['#', 'Repuesto', 'Asignado a', 'Precio']],
        body: order.workOrdersSpareParts?.length
            ? order.workOrdersSpareParts.map((p, i) => [
                `#${String(i + 1).padStart(2, '0')}`, p.sparePartName || '—', p.assignedEmployee || '—', fmt(p.priceApplied)
            ])
            : [['—', 'Sin repuestos registrados', '—', '$0.00']],
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 }, textColor: [60, 60, 60], lineColor: [235, 235, 235], lineWidth: 0.3 },
        headStyles: { fillColor: [245, 245, 245], textColor: [130, 130, 130], fontStyle: 'bold', fontSize: 7.5, lineWidth: 0 },
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
    // ABONOS ACTIVOS
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
    y = sectionHeader(doc, y, contentW, margin, pageW,
        'ABONOS REALIZADOS',
        `${activePayments.length} abono${activePayments.length !== 1 ? 's' : ''}`
    );

    doc.autoTable({
        head: [['#', 'Método', 'Registrado por', 'Fecha', 'Monto']],
        body: activePayments.length
            ? activePayments.map(p => [
                `#${p.paymentNumber}`, p.paymentMethodName || '—', p.employeeName || '—', p.paymentDate || '—', fmt(p.amount)
            ])
            : [['—', '—', 'Sin abonos registrados', '—', '$0.00']],
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 }, textColor: [60, 60, 60], lineColor: [235, 235, 235], lineWidth: 0.3 },
        headStyles: { fillColor: [245, 245, 245], textColor: [130, 130, 130], fontStyle: 'bold', fontSize: 7.5, lineWidth: 0 },
        columnStyles: {
            0: { cellWidth: 14, halign: 'center', textColor: [180, 180, 180] },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 26, halign: 'center', textColor: [130, 130, 130] },
            4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }
        },
        alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    y = doc.lastAutoTable.finalY + 6;

    // ═══════════════════════════════════════
    // ABONOS CANCELADOS
    // ═══════════════════════════════════════
    if (cancelledPayments.length > 0) {
        y = checkPageBreak(doc, y, 20, pageH, margin, pageW);
        y = sectionHeader(doc, y, contentW, margin, pageW,
            'ABONOS CANCELADOS',
            `${cancelledPayments.length} cancelado${cancelledPayments.length !== 1 ? 's' : ''}`
        );

        doc.autoTable({
            head: [['#', 'Método', 'Registrado por', 'Fecha', 'Monto']],
            body: cancelledPayments.map(p => [
                `#${p.paymentNumber}`, p.paymentMethodName || '—', p.employeeName || '—', p.paymentDate || '—', fmt(p.amount)
            ]),
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 }, textColor: [160, 80, 80], lineColor: [245, 220, 220], lineWidth: 0.3 },
            headStyles: { fillColor: [255, 240, 240], textColor: [180, 100, 100], fontStyle: 'bold', fontSize: 7.5, lineWidth: 0 },
            columnStyles: {
                0: { cellWidth: 14, halign: 'center' },
                1: { cellWidth: 30 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 26, halign: 'center' },
                4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
            },
            alternateRowStyles: { fillColor: [255, 248, 248] }
        });

        y = doc.lastAutoTable.finalY + 10;
    }

    // ═══════════════════════════════════════
    // RESUMEN FINANCIERO
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 56, pageH, margin, pageW);

    const totalServices   = (order.workOrdersServices   || []).reduce((a, s) => a + Number(s.priceApplied ?? 0), 0);
    const totalSpareParts = (order.workOrdersSpareParts || []).reduce((a, p) => a + Number(p.priceApplied ?? 0), 0);

    const summaryBoxH = 54;
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

    [
        { label: 'Total servicios',     value: fmt(totalServices),    color: [220, 220, 220] },
        { label: 'Total repuestos',      value: fmt(totalSpareParts),  color: [220, 220, 220] },
        { label: 'Costo de reparación', value: fmt(order.repairCost), color: [220, 220, 220] },
        { label: 'Total abonado',        value: fmt(totalPaid),        color: [109, 190, 69]  }
    ].forEach((row, i) => {
        const rowY = y + 19 + i * 7;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(row.label, margin + 8, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...row.color);
        doc.text(row.value, pageW - margin - 4, rowY, { align: 'right' });
    });

    const deudaY = y + 46;
    doc.setDrawColor(50, 50, 50);
    doc.line(margin + 8, deudaY - 3, pageW - margin - 4, deudaY - 3);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Deuda pendiente', margin + 8, deudaY + 3);
    doc.setTextColor(hasDebt ? 211 : 109, hasDebt ? 24 : 190, hasDebt ? 19 : 69);
    doc.setFontSize(12);
    doc.text(fmt(order.amountDue), pageW - margin - 4, deudaY + 3, { align: 'right' });

    y += summaryBoxH + 10;

    // ═══════════════════════════════════════
    // NOTAS
    // ═══════════════════════════════════════
    if (order.notes?.trim()) {
        y = checkPageBreak(doc, y, 24, pageH, margin, pageW);
        const notasLines = doc.splitTextToSize(order.notes.trim(), contentW - 12);
        const notasH     = Math.max(20, notasLines.length * 5 + 16);

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

    drawFooter(doc, pageW, pageH, margin);
    doc.save(`orden-${order.idWorkOrder.slice(0, 8)}.pdf`);
};
