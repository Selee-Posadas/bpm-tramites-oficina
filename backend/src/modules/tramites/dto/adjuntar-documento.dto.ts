import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class AdjuntarDocumentoDto {
  @IsString()
  @IsNotEmpty()
  nombreArchivo!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  @IsPositive()
  size!: number;

  @IsString()
  @IsNotEmpty()
  storageKey!: string;
}
