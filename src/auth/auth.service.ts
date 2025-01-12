import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<any> {
    const user = await this.prisma.appUser.findUnique({
      where: { email: username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { userId: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new Error('Invalid credentials');
  }

  async register(username: string, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.appUser.create({
      data: {
        email: username,
        password: hashedPassword,
        isEmailVerified: false,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`verificationToken:${verificationToken}`, user.id, {
      EX: 60 * 60 * 24, // 24 hours expiration
    });

    const verificationLink = `http://localhost:8080/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: ${verificationLink}`,
    });

    return user;
  }

  async verifyEmail(token: string): Promise<any> {
    const userId = await redisClient.get(`verificationToken:${token}`);
    if (userId) {
      await this.prisma.appUser.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });
      await redisClient.del(`verificationToken:${token}`);
      return { message: 'Email verified successfully' };
    }

    throw new Error('Invalid or expired verification token');
  }
}
