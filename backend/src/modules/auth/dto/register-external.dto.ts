import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterExternalDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @ApiProperty({ example: 'juan.perez@empresa.com' })
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe contener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({ example: '20-34567890-9' })
  @IsString()
  @IsNotEmpty({ message: 'El documento/CUIT es obligatorio' })
  documento!: string;

  @ApiProperty({ example: 'Proveedor S.A.' })
  @IsString()
  @IsNotEmpty({ message: 'La organización es obligatoria' })
  organizacion!: string;
}
