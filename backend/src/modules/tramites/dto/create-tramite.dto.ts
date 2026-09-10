import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PrioridadTramite } from '../domain/enums/prioridad-tramite.enum';

export class CreateTramiteDto {
  @IsUUID('all')
  @IsNotEmpty()
  tipoTramiteId!: string;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsEnum(PrioridadTramite)
  @IsOptional()
  prioridad?: PrioridadTramite;

  @IsUUID('all')
  @IsOptional()
  usuarioExternoId?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
