import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('connected to database');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const products = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true },
    });

    return {
      data: products,
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  findOne(id: number) {
    const product = this.product.findFirst({ where: { id, available: true } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { id: __, ...data } = updateProductDto;

    const product = await this.product.update({
      where: { id },
      data: data,
    });
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      throw new RpcException('Products not found');
    }
    return products;
  }
}
