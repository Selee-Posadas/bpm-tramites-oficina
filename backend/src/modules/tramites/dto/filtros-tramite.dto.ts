import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsUUID()
  @IsOptional()
  areaActualId?: string;

  @IsUUID()
  @IsOptional()
  usuarioAsignadoId?: string;

  @IsUUID()
  @IsOptional()
  usuarioExternoId?: string;

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
