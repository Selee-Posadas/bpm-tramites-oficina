import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AsignarTramiteDto {
  @IsUUID('all')
  @IsNotEmpty()
  operadorId!: string;
}

export class DerivarTramiteDto {
  @IsUUID('all')
  @IsNotEmpty()
  areaDestinoId!: string;

  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

export class ObservarTramiteDto {
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

export class ResponderObservacionDto {
  @IsString()
  @IsNotEmpty()
  respuesta!: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}

export class SolicitarIntervencionExternaDto {
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

export class ResponderIntervencionExternaDto {
  @IsString()
  @IsNotEmpty()
  respuesta!: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}

export class AprobarTramiteDto {
  @IsString()
  @IsOptional()
  motivo?: string;
}

export class RechazarTramiteDto {
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

export class CerrarTramiteDto {
  @IsString()
  @IsOptional()
  motivo?: string;
}

export class CancelarTramiteDto {
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}
