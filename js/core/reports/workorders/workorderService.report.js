// js/core/reports/workorders/work.order.service.report.js

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

/**
 * Dibuja fotos agrupadas por etapa.
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

export const generateServiceReport = async (service) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    const initials = (service.assignedEmployee || '')
        .trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

    const sortedPhotos = [...(service.photos || [])].sort(
        (a, b) => (STAGE_ORDER[a.imageStage] ?? 99) - (STAGE_ORDER[b.imageStage] ?? 99)
    );

    const photos = (await Promise.all(
        sortedPhotos.map(async (p) => {
            const result = await urlToBase64(p.photoUrl);
            if (!result) return null;
            return {
                b64: result.data,
                naturalW: result.w,
                naturalH: result.h,
                stage: p.imageStage
            };
        })
    )).filter(Boolean);

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
    doc.text('REPORTE DE SERVICIO', pageW - margin, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 200, 200);
    doc.text(service.name || '—', pageW - margin, 28, { align: 'right' });

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

    const photoCount = photos.length;
    const badgeLabel = photoCount > 0 ? `${photoCount} foto${photoCount !== 1 ? 's' : ''}` : 'Sin fotos';
    const badgeColor = photoCount > 0 ? [46, 125, 50] : [150, 150, 150];
    const bW = 30;
    doc.setFillColor(...badgeColor);
    doc.roundedRect(pageW - margin - bW, y - 5, bW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(badgeLabel.toUpperCase(), pageW - margin - bW / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ═══════════════════════════════════════
    // INFO DEL SERVICIO
    // ═══════════════════════════════════════
    y = sectionHeader(doc, y, contentW, margin, pageW, 'INFORMACIÓN DEL SERVICIO');
    y += 4;

    const colW = (contentW - 6) / 2;
    const col2X = margin + colW + 6;

    const serviceRows = [
        { label: 'Nombre', value: service.name },
        { label: 'Precio', value: fmt(service.priceApplied) }
    ];
    const leftBoxH = serviceRows.length * 9 + 16;

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, colW, leftBoxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, colW, leftBoxH, 3, 3, 'S');

    const t1W = 'SERVICIO'.length * 2.2 + 6;
    doc.setFillColor(211, 24, 19);
    doc.roundedRect(margin + 4, y + 4, t1W, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICIO', margin + 4 + t1W / 2, y + 7.5, { align: 'center' });

    serviceRows.forEach((row, i) => {
        const rowY = y + 16 + i * 9;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(row.label, margin + 4, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(String(row.value ?? '—'), margin + colW - 4, rowY, { align: 'right' });
        if (i < serviceRows.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(0.2);
            doc.line(margin + 4, rowY + 3, margin + colW - 4, rowY + 3);
        }
    });

    const mechBoxH = leftBoxH;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(col2X, y, colW, mechBoxH, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.roundedRect(col2X, y, colW, mechBoxH, 3, 3, 'S');

    const t2W = 'MECÁNICO'.length * 2.2 + 6;
    doc.setFillColor(211, 24, 19);
    doc.roundedRect(col2X + 4, y + 4, t2W, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('MECÁNICO', col2X + 4 + t2W / 2, y + 7.5, { align: 'center' });

    const avatarR = 7;
    const contentStartY = y + 16;
    const contentEndY = y + mechBoxH - 4;
    const centerY = (contentStartY + contentEndY) / 2;
    const avatarX = col2X + 6 + avatarR;

    doc.setFillColor(211, 24, 19);
    doc.circle(avatarX, centerY, avatarR, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(initials, avatarX, centerY + 1, { align: 'center' });

    const textX = avatarX + avatarR + 5;
    const nameLines = doc.splitTextToSize(service.assignedEmployee || '—', colW - (textX - col2X) - 4);
    const textBlockH = nameLines.length * 5 + 6;
    const textStartY = centerY - textBlockH / 2 + 3;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(nameLines, textX, textStartY);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
        `ID: ${service.idEmployee?.slice(0, 8).toUpperCase() || '—'}`,
        textX,
        textStartY + nameLines.length * 5 + 2
    );

    y += leftBoxH + 10;

    // ═══════════════════════════════════════
    // FOTOS
    // ═══════════════════════════════════════
    y = sectionHeader(
        doc, y, contentW, margin, pageW,
        'EVIDENCIA FOTOGRÁFICA',
        photoCount > 0 ? `${photoCount} foto${photoCount !== 1 ? 's' : ''}` : 'Sin fotos'
    );
    y += 4;

    if (photos.length === 0) {
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F');
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(margin, y, contentW, 20, 3, 3, 'S');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(180, 180, 180);
        doc.text('No hay fotos disponibles para este servicio.', pageW / 2, y + 13, { align: 'center' });
        y += 28;
    } else {
        y = drawServicePhotos(doc, photos, y, contentW, margin, pageH, pageW);
        y += 4;
    }

    // ═══════════════════════════════════════
    // RESUMEN DE PRECIO
    // ═══════════════════════════════════════
    y = checkPageBreak(doc, y, 30, pageH, margin, pageW);

    doc.setFillColor(22, 22, 22);
    doc.roundedRect(margin, y, contentW, 24, 3, 3, 'F');
    doc.setFillColor(211, 24, 19);
    doc.rect(margin, y, 3, 24, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 140);
    doc.text('Precio del servicio', margin + 8, y + 13);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(109, 190, 69);
    doc.text(fmt(service.priceApplied), pageW - margin - 4, y + 14, { align: 'right' });

    y += 28;

    drawFooter(doc, pageW, pageH, margin);

    const safeName = (service.name || 'servicio').replace(/\s+/g, '-').toLowerCase();
    doc.save(`servicio-${safeName}-${(service.idWorkOrderService || service.id || '').slice(0, 8)}.pdf`);
};
