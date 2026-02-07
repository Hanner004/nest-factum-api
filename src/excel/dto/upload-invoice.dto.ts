import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UploadInvoiceDto {
  @ApiProperty({
    type: String,
    format: 'binary',
    required: true,
  })
  file: Express.Multer.File;
  @ApiProperty({ example: 'Company ID' })
  @IsUUID()
  company_id: string;
  @ApiProperty({ example: 'Customer ID' })
  @IsUUID()
  customer_id: string;
}
