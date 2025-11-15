// src/services/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/schemas';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyGoogleToken(idToken: string) {
    if (!idToken) {
      throw new UnauthorizedException('Missing Google ID token');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const { email, name, picture, sub } = payload;

    // find-or-create user
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.createFromGoogle({
        email,
        name,
        picture,
        googleId: sub,
      });
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user._id,
        email: user.academicEmail,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      },
    );

    return {
      user,
      google: {email, name, picture, googleId: sub},
      accessToken
    }
  }

  async devLogin(data: { email: string; name: string; role: Role}) {
    let user = await this.usersService.findByEmail(data.email);
    if (!user) {
      user = await this.usersService.createFromGoogle({
        email: data.email,
        name: data.name
      });
    }

    if (user.role !== data.role) {
      const updated = await this.usersService['userModel'].findByIdAndUpdate(
        user._id,
        { role: data.role },
        { new: true},
      ).lean();
      user = updated
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user._id,
        email: user.academicEmail,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '2h',
      },
    );

    return {
      user, 
      accessToken
    };

  }
}
