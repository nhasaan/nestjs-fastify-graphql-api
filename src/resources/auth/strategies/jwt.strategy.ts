import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });

    this.logger.setContext('JwtStrategy');
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        this.logger.warn(`JWT validation failed for user ID: ${payload.sub}`);
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
