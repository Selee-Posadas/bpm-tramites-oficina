import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { VisibilidadComentario } from '../domain/enums/visibilidad-comentario.enum';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  mensaje!: string;

  @IsEnum(VisibilidadComentario)
  @IsOptional()
  visibilidad?: VisibilidadComentario;
}
