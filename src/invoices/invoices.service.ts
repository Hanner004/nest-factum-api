import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { InvoiceItem } from '@/invoices/entities/invoiceItem.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoicesRepository.count({ withDeleted: true });
    const nextNumber = count + 1;
    return `INV-${nextNumber.toString().padStart(6, '0')}`;
  }

  async create({ company_id, customer_id, items }: CreateInvoiceDto) {
    const IVA = 0.19;

    const invoiceNumber = await this.generateInvoiceNumber();

    let subtotal = 0;

    const preparedItems = items.map((item) => {
      const total = item.quantity * item.unit_price;
      subtotal += total;

      return {
        ...item,
        total,
      };
    });

    const tax = subtotal * IVA;
    const total = subtotal + tax;

    const invoice = this.invoicesRepository.create({
      invoice_number: invoiceNumber,
      issue_date: new Date(),
      subtotal,
      tax,
      total,
      company: { id: company_id },
      customer: { id: customer_id },
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    const invoiceItems = preparedItems.map((item) =>
      this.invoiceItemsRepository.create({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        invoice: savedInvoice,
      }),
    );

    await this.invoiceItemsRepository.save(invoiceItems);

    return savedInvoice;
  }

  async findAll() {
    return await this.invoicesRepository.find({
      relations: ['customer', 'company', 'items'],
      withDeleted: true,
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['customer', 'company', 'items'],
      withDeleted: true,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async remove(id: string) {
    await this.invoiceItemsRepository.softDelete({ invoice: { id } });
    await this.invoicesRepository.softDelete(id);
    return { deleted: true };
  }
}
