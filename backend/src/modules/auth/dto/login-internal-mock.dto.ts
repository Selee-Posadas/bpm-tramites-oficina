import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolInterno } from '../../usuarios/domain/enums/rol-interno.enum';

export class LoginInternalMockDto {
  @ApiProperty({
    enum: RolInterno,
    example: RolInterno.OPERADOR,
    description: 'Rol interno que se desea emular',
  })
  @IsEnum(RolInterno, { message: 'El rol interno especificado no es válido' })
  rol!: RolInterno;

  @ApiProperty({ example: 'admin@bpm.local', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}
