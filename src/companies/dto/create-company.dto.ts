import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Solutions' })
  @IsString()
  name: string;
  @ApiProperty({ example: '900123456-7' })
  @IsString()
  nit: string;
  @ApiProperty({ example: 'Carrera 66 #45-67' })
  @IsString()
  address: string;
}
