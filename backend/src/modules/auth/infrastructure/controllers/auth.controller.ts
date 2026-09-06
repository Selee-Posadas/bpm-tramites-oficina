import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthExternalService, AuthTokenResponse } from '../../application/auth-external.service';
import { AuthInternalService } from '../../application/auth-internal.service';
import { RegisterExternalDto } from '../../dto/register-external.dto';
import { LoginExternalDto } from '../../dto/login-external.dto';
import { LoginInternalMockDto } from '../../dto/login-internal-mock.dto';
import { ExternalAuthGuard } from '../guards/external-auth.guard';
import { InternalAuthGuard } from '../guards/internal-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../../domain/auth-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authExternalService: AuthExternalService,
    private readonly authInternalService: AuthInternalService,
  ) {}

  @Post('external/register')
  @HttpCode(HttpStatus.CREATED)
  async registerExternal(
    @Body() dto: RegisterExternalDto,
  ): Promise<AuthTokenResponse> {
    return await this.authExternalService.register(dto);
  }

  @Post('external/login')
  @HttpCode(HttpStatus.OK)
  async loginExternal(
    @Body() dto: LoginExternalDto,
  ): Promise<AuthTokenResponse> {
    return await this.authExternalService.login(dto);
  }

  @Get('external/me')
  @UseGuards(ExternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getExternalMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthenticatedUser> {
    return await this.authExternalService.getMe(user.id);
  }

  @Post('internal/login')
  @HttpCode(HttpStatus.OK)
  async loginInternalMock(
    @Body() dto: LoginInternalMockDto,
  ): Promise<AuthTokenResponse> {
    return await this.authInternalService.loginMock(dto);
  }

  @Get('internal/me')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getInternalMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthenticatedUser> {
    return await this.authInternalService.getInternalMe(user.id);
  }
}
