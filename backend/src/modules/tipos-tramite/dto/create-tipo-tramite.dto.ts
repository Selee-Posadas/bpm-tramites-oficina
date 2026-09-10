import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTipoTramiteDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsNumber()
  @IsPositive()
  slaHoras!: number;

  @IsUUID('all')
  @IsNotEmpty()
  areaInicialId!: string;

  @IsBoolean()
  @IsOptional()
  requiereExterno?: boolean;

  @IsBoolean()
  @IsOptional()
  permiteInicioExterno?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
