import { Injectable, ForbiddenException } from '@nestjs/common';
import { User, Note } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDTO } from './dto';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config/dist';
@Injectable({})
export class AuthService {
  constructor(
    private primaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async register(authDTO: AuthDTO) {
    //generate password to hashedpassword
    const hashedPassword = await argon.hash(authDTO.password);
    //insert data to db
    try {
      const user = await this.primaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashedPassword,
          firstName: '',
          lastName: '',
        },
        //show id,email,createdAt when register successfully
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ForbiddenException('User with this email is exist');
      }
    }
  }
  async login(authDTO: AuthDTO) {
    const user = await this.primaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('user not found');
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new ForbiddenException('Incorrect email or password');
    }
    delete user.hashedPassword;
    return await this.signJwtToken(user.id, user.email);
  }

  async signJwtToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      accessToken: jwtString,
    };
  }
}
