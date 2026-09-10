import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoTramite } from '../domain/enums/estado-tramite.enum';
import { OrigenTramite } from '../domain/enums/origen-tramite.enum';
import { PrioridadTramite } from '../domain/enums/prioridad-tramite.enum';

export class FiltrosTramiteDto {
  @IsEnum(EstadoTramite)
  @IsOptional()
  estado?: EstadoTramite;

  @IsEnum(OrigenTramite)
  @IsOptional()
  origen?: OrigenTramite;

  @IsEnum(PrioridadTramite)
  @IsOptional()
  prioridad?: PrioridadTramite;

  @IsUUID('all')
  @IsOptional()
  areaActualId?: string;

  @IsUUID('all')
  @IsOptional()
  areaId?: string;

  @IsUUID('all')
  @IsOptional()
  tipoTramiteId?: string;

  @IsUUID('all')
  @IsOptional()
  usuarioAsignadoId?: string;

  @IsUUID('all')
  @IsOptional()
  usuarioExternoId?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true || value === 1 || value === '1';
  })
  @IsBoolean()
  @IsOptional()
  soloVencidos?: boolean;

  @IsString()
  @IsOptional()
  busqueda?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 20;
}
