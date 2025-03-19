import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './inputs/login.input';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('AuthService');
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (user && (await user.comparePassword(password))) {
        const { password, ...result } = user.toObject();
        return result;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      return null;
    }
  }

  async login(loginInput: LoginInput) {
    this.logger.log(`Attempting login for user: ${loginInput.email}`);

    const user = await this.validateUser(loginInput.email, loginInput.password);

    if (!user) {
      this.logger.warn(`Invalid credentials for user: ${loginInput.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
