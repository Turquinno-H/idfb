import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenPair } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SwitchCompanyDto } from './dto/switch-company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private context(req: Request): { ipAddress?: string; userAgent?: string } {
    return { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new company and its first administrator user' })
  register(@Body() dto: RegisterDto, @Req() req: Request): Promise<TokenPair> {
    return this.authService.register(dto, this.context(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<TokenPair | { companies: { id: string; name: string }[] }> {
    return this.authService.login(dto, this.context(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and obtain a new access token' })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<TokenPair> {
    return this.authService.refresh(dto.refreshToken, this.context(req));
  }

  @ApiBearerAuth()
  @Post('switch-company')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch the active company context for a multi-company account' })
  switchCompany(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SwitchCompanyDto,
    @Req() req: Request,
  ): Promise<TokenPair> {
    return this.authService.switchCompany(user.userId, dto.companyId, this.context(req));
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the presented refresh token' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change the current user password and revoke all sessions' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(user.userId, dto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user profile and permission set' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
