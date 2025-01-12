import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<any> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<any> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
