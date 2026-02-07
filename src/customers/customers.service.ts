import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@/customers/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  private async ensureDocumentNumberIsUnique(
    document_number: string,
  ): Promise<void> {
    const existingCustomer = await this.customersRepository.findOneBy({
      document_number,
    });
    if (existingCustomer) {
      throw new ConflictException(
        'Customer with this document number already exists',
      );
    }
  }

  async create(createCustomerDto: CreateCustomerDto) {
    await this.ensureDocumentNumberIsUnique(createCustomerDto.document_number);

    const customer = this.customersRepository.create(createCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async findAll() {
    return await this.customersRepository.find();
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return await this.customersRepository.update(id, updateCustomerDto);
  }

  async remove(id: string) {
    return await this.customersRepository.softDelete(id);
  }
}
