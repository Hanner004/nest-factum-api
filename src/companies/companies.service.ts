import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@/companies/entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  private async ensureNitIsUnique(nit: string): Promise<void> {
    const existingCompany = await this.companiesRepository.findOneBy({ nit });
    if (existingCompany) {
      throw new ConflictException('Company with this NIT already exists');
    }
  }

  async create(createCompanyDto: CreateCompanyDto) {
    await this.ensureNitIsUnique(createCompanyDto.nit);

    const company = this.companiesRepository.create(createCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async findAll() {
    return await this.companiesRepository.find();
  }

  async findOne(id: string) {
    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return await this.companiesRepository.update(id, updateCompanyDto);
  }

  async remove(id: string) {
    return await this.companiesRepository.softDelete(id);
  }
}
