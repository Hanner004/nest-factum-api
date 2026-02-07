import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InvoicesService } from '@/invoices/invoices.service';
import { InvoiceRow } from './interfaces/invoice-row.interface';

@Injectable()
export class ExcelService {
  constructor(private readonly invoicesService: InvoicesService) {}

  generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Descripción: 'Mouse inalámbrico Logitech',
        Cantidad: 2,
        Precio: 100000,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    worksheet['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 14 }];

    return XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
  }

  async processExcel(buffer: Buffer, company_id: string, customer_id: string) {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: InvoiceRow[] = XLSX.utils.sheet_to_json(worksheet);

    const items = rows.map((row) => ({
      description: row['Descripción']?.toString().trim(),
      quantity: Number(row['Cantidad']),
      unit_price: Number(row['Precio']),
    }));

    const invoice = await this.invoicesService.create({
      company_id,
      customer_id,
      items,
    });

    return {
      rows_length: rows.length,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
    };
  }
}
