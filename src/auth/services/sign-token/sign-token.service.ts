import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';

@Injectable()
export class SignTokenService {
  constructor(private jwt: JwtService) {}

  async signToken(userId: number, email: string): Promise<{ token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = process.env.JWT_SECRET;
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret,
    });
    return { token };
  }
}
