import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolInterno[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
