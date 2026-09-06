import {
  IsString,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateTipoTramiteDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  slaHoras?: number;

  @IsUUID()
  @IsOptional()
  areaInicialId?: string;

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
