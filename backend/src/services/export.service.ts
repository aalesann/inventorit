import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import reportsRepository from '../repositories/reports.repository';
import { ReportFilters } from '../repositories/reports.repository';
import logger from '../utils/logger';

class ExportService {
    /**
     * Exportar resumen general a XLSX
     */
    async exportResumenGeneralXLSX(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getGeneralSummary(filters);

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Sistema de Gestión de Inventario';
            workbook.created = new Date();

            // Hoja 1: Resumen
            const sheet = workbook.addWorksheet('Resumen General', {
                views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
            });

            // Título
            sheet.mergeCells('A1:D1');
            const titleCell = sheet.getCell('A1');
            titleCell.value = 'RESUMEN GENERAL DE INVENTARIO';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FF3B82F6' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(1).height = 30;

            // Información general
            sheet.getCell('A3').value = 'Total de Equipos:';
            sheet.getCell('A3').font = { bold: true };
            sheet.getCell('B3').value = data.totalGeneral;
            sheet.getCell('B3').font = { size: 14, bold: true, color: { argb: 'FF3B82F6' } };

            sheet.getCell('A4').value = 'Fecha de Generación:';
            sheet.getCell('A4').font = { bold: true };
            sheet.getCell('B4').value = new Date().toLocaleString('es-AR');

            // Tabla: Equipos por Tipo
            sheet.getCell('A6').value = 'EQUIPOS POR TIPO';
            sheet.getCell('A6').font = { size: 12, bold: true };

            const tipoHeaders = ['Categoría', 'Cantidad'];
            sheet.getRow(7).values = tipoHeaders;
            this.styleHeader(sheet.getRow(7));

            let row = 8;
            data.porTipo.forEach(item => {
                sheet.getRow(row).values = [item.categoria_nombre, item.cantidad];
                this.styleDataRow(sheet.getRow(row), row % 2 === 0);
                row++;
            });

            // Total
            sheet.getRow(row).values = ['TOTAL', data.totalGeneral];
            this.styleTotalRow(sheet.getRow(row));

            // Tabla: Equipos por Estado
            sheet.getCell('D6').value = 'EQUIPOS POR ESTADO';
            sheet.getCell('D6').font = { size: 12, bold: true };

            const estadoHeaders = ['Estado', 'Cantidad'];
            const estadoHeaderRow = sheet.getRow(7);
            estadoHeaderRow.getCell(4).value = estadoHeaders[0];
            estadoHeaderRow.getCell(5).value = estadoHeaders[1];
            this.styleHeader(estadoHeaderRow, 4, 5);

            row = 8;
            data.porEstado.forEach(item => {
                const dataRow = sheet.getRow(row);
                dataRow.getCell(4).value = this.getEstadoLabel(item.estado);
                dataRow.getCell(5).value = item.cantidad;
                this.styleDataRow(dataRow, row % 2 === 0, 4, 5);
                row++;
            });

            // Ajustar anchos de columna
            sheet.getColumn(1).width = 30;
            sheet.getColumn(2).width = 15;
            sheet.getColumn(4).width = 25;
            sheet.getColumn(5).width = 15;

            // Enviar archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=resumen_general_${new Date().toISOString().split('T')[0]}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

            logger.info('Resumen general exportado a XLSX');
        } catch (error) {
            logger.error('Error al exportar resumen general a XLSX', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    /**
     * Exportar equipos por área a XLSX
     */
    async exportPorAreaXLSX(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getEquipmentByArea(filters);

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Equipos por Área');

            // Título
            sheet.mergeCells('A1:F1');
            const titleCell = sheet.getCell('A1');
            titleCell.value = 'EQUIPOS POR ÁREA / SECTOR';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FF3B82F6' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(1).height = 30;

            // Encabezados
            const headers = ['Área', 'Total', 'En Uso', 'En Depósito', 'En Reparación', 'Baja'];
            sheet.getRow(3).values = headers;
            this.styleHeader(sheet.getRow(3));

            // Datos
            let row = 4;
            let totalGeneral = 0;
            data.forEach(item => {
                sheet.getRow(row).values = [
                    item.area,
                    item.total,
                    item.en_uso,
                    item.en_deposito,
                    item.en_reparacion,
                    item.baja
                ];
                this.styleDataRow(sheet.getRow(row), row % 2 === 0);
                totalGeneral += item.total;
                row++;
            });

            // Total
            sheet.getRow(row).values = ['TOTAL', totalGeneral, '', '', '', ''];
            this.styleTotalRow(sheet.getRow(row));

            // Ajustar anchos
            sheet.columns.forEach((column, index) => {
                column.width = index === 0 ? 30 : 15;
            });

            // Enviar archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=equipos_por_area_${new Date().toISOString().split('T')[0]}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

            logger.info('Equipos por área exportados a XLSX');
        } catch (error) {
            logger.error('Error al exportar equipos por área a XLSX', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    /**
     * Exportar equipos por usuario a XLSX
     */
    async exportPorUsuarioXLSX(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getEquipmentByUser(filters);

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Equipos por Usuario');

            // Título
            sheet.mergeCells('A1:B1');
            const titleCell = sheet.getCell('A1');
            titleCell.value = 'EQUIPOS POR USUARIO ASIGNADO';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FF3B82F6' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(1).height = 30;

            // Encabezados
            const headers = ['Usuario', 'Cantidad de Equipos'];
            sheet.getRow(3).values = headers;
            this.styleHeader(sheet.getRow(3));

            // Datos
            let row = 4;
            let totalEquipos = 0;
            data.forEach(item => {
                sheet.getRow(row).values = [item.usuario, item.cantidad];
                this.styleDataRow(sheet.getRow(row), row % 2 === 0);
                totalEquipos += item.cantidad;
                row++;
            });

            // Total
            sheet.getRow(row).values = ['TOTAL', totalEquipos];
            this.styleTotalRow(sheet.getRow(row));

            // Ajustar anchos
            sheet.getColumn(1).width = 40;
            sheet.getColumn(2).width = 20;

            // Enviar archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=equipos_por_usuario_${new Date().toISOString().split('T')[0]}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

            logger.info('Equipos por usuario exportados a XLSX');
        } catch (error) {
            logger.error('Error al exportar equipos por usuario a XLSX', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    /**
     * Exportar resumen general a PDF
     */
    async exportResumenGeneralPDF(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getGeneralSummary(filters);

            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=resumen_general_${new Date().toISOString().split('T')[0]}.pdf`);

            doc.pipe(res);

            // Encabezado
            this.addPDFHeader(doc, 'RESUMEN GENERAL DE INVENTARIO');

            // Información general
            doc.fontSize(12).fillColor('#000000');
            doc.text(`Total de Equipos: ${data.totalGeneral}`, { continued: false });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#666666');
            doc.text(`Fecha de Generación: ${new Date().toLocaleString('es-AR')}`, { continued: false });
            doc.moveDown(2);

            // Tabla: Equipos por Tipo
            doc.fontSize(14).fillColor('#3B82F6').text('Equipos por Tipo', { underline: true });
            doc.moveDown(1);

            const tipoTableData = data.porTipo.map(item => [item.categoria_nombre, item.cantidad.toString()]);
            this.drawPDFTable(doc, ['Categoría', 'Cantidad'], tipoTableData);

            doc.moveDown(2);

            // Tabla: Equipos por Estado
            doc.fontSize(14).fillColor('#3B82F6').text('Equipos por Estado', { underline: true });
            doc.moveDown(1);

            const estadoTableData = data.porEstado.map(item => [
                this.getEstadoLabel(item.estado),
                item.cantidad.toString()
            ]);
            this.drawPDFTable(doc, ['Estado', 'Cantidad'], estadoTableData);

            // Pie de página
            this.addPDFFooter(doc);

            doc.end();

            logger.info('Resumen general exportado a PDF');
        } catch (error) {
            logger.error('Error al exportar resumen general a PDF', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    /**
     * Exportar equipos por área a PDF
     */
    async exportPorAreaPDF(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getEquipmentByArea(filters);

            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=equipos_por_area_${new Date().toISOString().split('T')[0]}.pdf`);

            doc.pipe(res);

            // Encabezado
            this.addPDFHeader(doc, 'EQUIPOS POR ÁREA / SECTOR');

            // Tabla
            const tableData = data.map(item => [
                item.area,
                item.total.toString(),
                item.en_uso.toString(),
                item.en_deposito.toString(),
                item.en_reparacion.toString(),
                item.baja.toString()
            ]);

            this.drawPDFTable(doc, ['Área', 'Total', 'En Uso', 'En Depósito', 'En Reparación', 'Baja'], tableData, 80);

            // Pie de página
            this.addPDFFooter(doc);

            doc.end();

            logger.info('Equipos por área exportados a PDF');
        } catch (error) {
            logger.error('Error al exportar equipos por área a PDF', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    /**
     * Exportar equipos por usuario a PDF
     */
    async exportPorUsuarioPDF(filters: ReportFilters, res: Response) {
        try {
            const data = await reportsRepository.getEquipmentByUser(filters);

            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=equipos_por_usuario_${new Date().toISOString().split('T')[0]}.pdf`);

            doc.pipe(res);

            // Encabezado
            this.addPDFHeader(doc, 'EQUIPOS POR USUARIO ASIGNADO');

            // Tabla
            const tableData = data.map(item => [
                item.usuario,
                item.cantidad.toString()
            ]);

            this.drawPDFTable(doc, ['Usuario', 'Cantidad de Equipos'], tableData);

            // Pie de página
            this.addPDFFooter(doc);

            doc.end();

            logger.info('Equipos por usuario exportados a PDF');
        } catch (error) {
            logger.error('Error al exportar equipos por usuario a PDF', { error });
            // Si los headers ya fueron enviados, no podemos usar el error handler
            if (!res.headersSent) {
                throw error;
            } else {
                // Si ya se enviaron headers, terminamos la respuesta
                res.end();
            }
        }
    }

    // ========== Métodos auxiliares ==========

    private styleHeader(row: ExcelJS.Row, startCol: number = 1, endCol?: number) {
        const end = endCol || row.cellCount;
        for (let i = startCol; i <= end; i++) {
            const cell = row.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF3B82F6' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }
        row.height = 25;
    }

    private styleDataRow(row: ExcelJS.Row, isEven: boolean, startCol: number = 1, endCol?: number) {
        const end = endCol || row.cellCount;
        for (let i = startCol; i <= end; i++) {
            const cell = row.getCell(i);
            if (isEven) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF9FAFB' }
                };
            }
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Alinear números a la derecha
            if (typeof cell.value === 'number') {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        }
    }

    private styleTotalRow(row: ExcelJS.Row) {
        for (let i = 1; i <= row.cellCount; i++) {
            const cell = row.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE5E7EB' }
            };
            cell.font = { bold: true, size: 11 };
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'medium', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            cell.alignment = { vertical: 'middle' };

            if (typeof cell.value === 'number') {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        }
    }

    private addPDFHeader(doc: PDFKit.PDFDocument, title: string) {
        doc.fontSize(20).fillColor('#3B82F6').text(title, { align: 'center' });
        doc.moveDown(0.5);
        doc.strokeColor('#3B82F6').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(2);
    }

    private addPDFFooter(doc: PDFKit.PDFDocument) {
        const bottom = doc.page.height - 50;
        doc.fontSize(8).fillColor('#666666');
        doc.text(
            `Generado el ${new Date().toLocaleString('es-AR')} | Sistema de Gestión de Inventario`,
            50,
            bottom,
            { align: 'center', width: 495 }
        );
    }

    private drawPDFTable(doc: PDFKit.PDFDocument, headers: string[], data: string[][], colWidth: number = 120) {
        const startX = 50;
        let startY = doc.y;
        const rowHeight = 25;
        const headerHeight = 30;

        // Encabezados
        doc.fontSize(10).fillColor('#FFFFFF');
        headers.forEach((header, i) => {
            doc.rect(startX + (i * colWidth), startY, colWidth, headerHeight)
                .fillAndStroke('#3B82F6', '#000000');
            doc.fillColor('#FFFFFF').text(
                header,
                startX + (i * colWidth) + 5,
                startY + 10,
                { width: colWidth - 10, align: 'center' }
            );
        });

        startY += headerHeight;

        // Datos
        data.forEach((row, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const fillColor = isEven ? '#FFFFFF' : '#F9FAFB';

            row.forEach((cell, colIndex) => {
                doc.rect(startX + (colIndex * colWidth), startY, colWidth, rowHeight)
                    .fillAndStroke(fillColor, '#E5E7EB');
                doc.fillColor('#000000').fontSize(9).text(
                    cell,
                    startX + (colIndex * colWidth) + 5,
                    startY + 8,
                    { width: colWidth - 10 }
                );
            });

            startY += rowHeight;
        });

        doc.y = startY + 20;
    }

    private getEstadoLabel(estado: string): string {
        const labels: Record<string, string> = {
            'EN_USO': 'En Uso',
            'EN_DEPOSITO': 'En Depósito',
            'EN_REPARACION': 'En Reparación',
            'BAJA': 'Baja'
        };
        return labels[estado] || estado;
    }
}

export default new ExportService();
