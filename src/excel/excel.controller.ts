import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';

import { UploadInvoiceDto } from './dto/upload-invoice.dto';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('invoice/template')
  downloadTemplate(@Res() res: Response) {
    const buffer = this.excelService.generateTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=invoice-template.xlsx',
    );
    res.send(buffer);
  }

  @Post('invoice/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadInvoiceDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, callback) => {
        const isExcel = /\.(xlsx|xls)$/i.test(file.originalname);

        if (!isExcel) {
          return callback(
            new BadRequestException(
              'Solo se permiten archivos Excel (.xlsx, .xls)',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async processUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('company_id') company_id: string,
    @Body('customer_id') customer_id: string,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo es requerido');
    }

    return await this.excelService.processExcel(
      file.buffer,
      company_id,
      customer_id,
    );
  }
}
