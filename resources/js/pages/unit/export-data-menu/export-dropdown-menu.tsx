import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { formatDate } from "@/lib/format-date";
import { DownloadCloud } from "lucide-react";


interface ExportDropdownMenuProps<TData> {
  data: TData[];
}


export function ExportDropdownMenu<TData>({
  data: data
}: ExportDropdownMenuProps<TData>) {
  const { t } = useTranslation()

  const exportcolumns = [
    t("page.unit.data_table.columns.name_column_label", "Nama"),
    t("page.unit.data_table.columns.created_at_column_label", "Tanggal dibuat"),
    t("page.unit.data_table.columns.updated_at_column_label", "Tanggal diperbarui"),
  ];



  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = data.map((row: any) => ({
      name: row.name || '',
      created_at: formatDate(row.created_at) || '',
      updated_at: formatDate(row.updated_at) || '',
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Change displayed column titles
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [exportcolumns],
      { origin: "A1" }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("page.unit.page_name", "Satuan"));

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 20 },
    ];

    // Generate file name with current timestamp
    const fileName = `${t("page.unit.page_name", "Satuan")}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write the file
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPDF = () => {
    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add title
    doc.setFontSize(16);
    doc.text(t("page.unit.page_name", "Satuan"), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add metadata
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 10;

    // Add table headers
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const columnWidths = [50, 70, 35];
    let xPosition = 10;

    exportcolumns.forEach((col, index) => {
      doc.text(col, xPosition, yPosition);
      xPosition += columnWidths[index];
    });

    yPosition += 8;
    doc.setDrawColor(200);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 5;

    // Add table data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    data.forEach((row: any) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      xPosition = 10;
      const rowData = [
        row.name || '',
        row.created_at ? formatDate(row.created_at) : '',
        row.updated_at ? formatDate(row.updated_at) : '',
      ];

      rowData.forEach((cell, index) => {
        const cellText = String(cell).substring(0, 20);
        doc.text(cellText, xPosition, yPosition);
        xPosition += columnWidths[index];
      });

      yPosition += 7;
    });

    // Generate file name with current timestamp
    const fileName = `${t("page.unit.page_name", "Satuan")}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save the document
    doc.save(fileName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <DownloadCloud className="h-4" />
          {t("component.data_table.export.label", "Ekspor")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleExportExcel}>
            {t("component.data_table.export.export_excel_btn", "Ekspor Excel")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF}>
            {t("component.data_table.export.export_pdf_btn", "Ekspor Pdf")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}