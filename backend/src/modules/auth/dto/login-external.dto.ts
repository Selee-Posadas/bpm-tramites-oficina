import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginExternalDto {
  @ApiProperty({ example: 'juan.perez@empresa.com' })
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
