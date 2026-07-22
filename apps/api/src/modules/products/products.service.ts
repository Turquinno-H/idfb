import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

type ProductEntity = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
    unit: true;
    taxRate: true;
    currency: true;
  };
}>;

const PRODUCT_INCLUDE = {
  category: true,
  brand: true,
  unit: true,
  taxRate: true,
  currency: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCurrencyId(
    companyId: string,
    currencyId?: string,
  ): Promise<string> {
    if (currencyId) {
      return currencyId;
    }
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { baseCurrencyId: true },
    });
    return company.baseCurrencyId;
  }

  async create(
    companyId: string,
    dto: CreateProductDto,
  ): Promise<ProductEntity> {
    const currencyId = await this.resolveCurrencyId(companyId, dto.currencyId);

    return this.prisma.product.create({
      data: {
        companyId,
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        unitId: dto.unitId,
        taxRateId: dto.taxRateId,
        currencyId,
        purchasePrice: dto.purchasePrice ?? 0,
        salesPrice: dto.salesPrice ?? 0,
        minStockLevel: dto.minStockLevel,
        trackBatch: dto.trackBatch ?? false,
        trackSerial: dto.trackSerial ?? false,
        isActive: dto.isActive ?? true,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ProductEntity>> {
    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      include: PRODUCT_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    await this.findOne(companyId, id);
    return this.prisma.product.update({
      where: { id },
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        unitId: dto.unitId,
        taxRateId: dto.taxRateId,
        currencyId: dto.currencyId,
        purchasePrice: dto.purchasePrice,
        salesPrice: dto.salesPrice,
        minStockLevel: dto.minStockLevel,
        trackBatch: dto.trackBatch,
        trackSerial: dto.trackSerial,
        isActive: dto.isActive,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async remove(companyId: string, id: string): Promise<ProductEntity> {
    await this.findOne(companyId, id);
    const movements = await this.prisma.stockMovement.count({
      where: { companyId, productId: id },
    });
    if (movements > 0) {
      throw new BadRequestException(
        'Product has stock movements and cannot be deleted; deactivate it instead',
      );
    }
    return this.prisma.product.delete({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
  }
}
