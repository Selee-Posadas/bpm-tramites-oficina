import {
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PrioridadTramite } from '../domain/enums/prioridad-tramite.enum';

export class UpdateTramiteDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(PrioridadTramite)
  @IsOptional()
  prioridad?: PrioridadTramite;
}
