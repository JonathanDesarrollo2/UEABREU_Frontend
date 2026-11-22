import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import ExcelJS from 'exceljs';

// pdfmake 0.3.x: vfs_fonts exporta directamente el mapa de fuentes (CJS). Se registran
// las fuentes de forma explícita para soportar variaciones del export en Vite.
const anyPdfMake: any = pdfMake as any;
const anyFonts: any = pdfFonts as any;
const vfs = anyFonts?.pdfMake?.vfs || anyFonts?.vfs || anyFonts?.default?.pdfMake?.vfs || anyFonts?.default?.vfs || anyFonts?.default || anyFonts;
if (typeof anyPdfMake.addVirtualFileSystem === 'function') {
  anyPdfMake.addVirtualFileSystem(vfs);
} else {
  anyPdfMake.vfs = vfs;
}

export interface ExportColumn {
  header: string;
  key: string;
  width?: number | 'auto' | '*';
  formatter?: (value: any, row: any) => string;
}

export interface ExportOptions {
  title: string;
  filters?: string[];
  columns: ExportColumn[];
  rows: any[];
  filename: string;
}

const timestamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const exportToPdf = async (opts: ExportOptions): Promise<void> => {
  const { title, filters = [], columns, rows, filename } = opts;

  const headerInfo: any[] = [
    { text: title, style: 'title', alignment: 'center' },
    { text: `Generado el ${new Date().toLocaleString('es-VE')}`, style: 'subtitle', alignment: 'center' },
  ];

  if (filters.length > 0) {
    headerInfo.push({ text: 'Filtros aplicados:', style: 'filterLabel', margin: [0, 8, 0, 2] });
    filters.forEach((f) => headerInfo.push({ text: `• ${f}`, style: 'filterItem' }));
  }

  headerInfo.push({ text: `Total: ${rows.length} registro(s)`, style: 'total', alignment: 'center', margin: [0, 6, 0, 6] });

  const body: any[] = [
    columns.map((c) => ({ text: c.header, style: 'tableHeader' })),
    ...rows.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        if (c.formatter) return c.formatter(val, row);
        return val !== undefined && val !== null && val !== '' ? String(val) : '—';
      })
    ),
  ];

  const docDefinition: any = {
    pageOrientation: 'landscape',
    pageMargins: [24, 24, 24, 24],
    content: [
      ...headerInfo,
      {
        table: { headerRows: 1, widths: columns.map((c) => c.width || '*'), body },
        layout: { fillColor: (rowIndex: number) => (rowIndex === 0 ? '#e5e7eb' : null) },
      },
    ],
    styles: {
      title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 10, color: '#555', margin: [0, 0, 0, 4] },
      filterLabel: { fontSize: 9, bold: true },
      filterItem: { fontSize: 9, margin: [8, 0, 0, 0] },
      total: { fontSize: 10, bold: true },
      tableHeader: { fontSize: 9, bold: true },
    },
    defaultStyle: { fontSize: 8 },
  };

  await anyPdfMake.createPdf(docDefinition).download(`${filename}_${timestamp()}.pdf`);
};

export const exportToExcel = async (opts: ExportOptions): Promise<void> => {
  const { title, filters = [], columns, rows, filename } = opts;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema de Gestión Escolar';
  wb.created = new Date();

  // Excel limita el nombre de hoja a 31 caracteres y prohíbe ciertos símbolos
  const sheetName = title.replace(/[\\/*?:[\]]/g, ' ').slice(0, 31);
  const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });

  const headerRow = ws.addRow(columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  rows.forEach((row) => {
    const values = columns.map((c) => {
      const val = row[c.key];
      return c.formatter ? c.formatter(val, row) : (val ?? '');
    });
    ws.addRow(values);
  });

  columns.forEach((_c, i) => { ws.getColumn(i + 1).width = 20; });

  if (filters.length > 0) {
    ws.addRow([]);
    ws.addRow(['Filtros aplicados:']);
    filters.forEach((f) => ws.addRow([f]));
  }
  ws.addRow([]);
  ws.addRow([`Total: ${rows.length} registro(s)`]);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${timestamp()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
