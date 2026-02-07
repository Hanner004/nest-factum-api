import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { InvoicesModule } from '@/invoices/invoices.module';

@Module({
  imports: [InvoicesModule],
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}
