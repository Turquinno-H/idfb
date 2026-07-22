/**
 * CRUD module scaffolder for simple tenant-scoped entities.
 * Emits module/service/controller/dto files that follow the exact same
 * conventions as the hand-written categories module (strict TS, RBAC,
 * audit, pagination). Complex transactional modules are written by hand.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, '..', 'src', 'modules');

/**
 * @typedef {Object} FieldSpec
 * @property {string} name
 * @property {string} tsType
 * @property {string} validator      class-validator decorator block
 * @property {boolean} [optional]
 * @property {boolean} [immutableOnUpdate]
 */

/** @type {Array<{
 *  dir: string, prismaModel: string, prismaDelegate: string, className: string,
 *  route: string, tag: string, permission: string, searchField: string,
 *  orderBy: string, fields: FieldSpec[]
 * }>} */
const specs = [
  {
    dir: 'units',
    prismaModel: 'Unit',
    prismaDelegate: 'unit',
    className: 'Units',
    route: 'units',
    tag: 'units',
    permission: 'unit',
    searchField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(100)", example: 'Adet' },
      { name: 'code', tsType: 'string', validator: "@IsString()\n  @MaxLength(20)", example: 'ADET' },
      { name: 'isActive', tsType: 'boolean', validator: '@IsBoolean()', optional: true, default: 'true' },
    ],
  },
  {
    dir: 'tax-rates',
    prismaModel: 'TaxRate',
    prismaDelegate: 'taxRate',
    className: 'TaxRates',
    route: 'tax-rates',
    tag: 'tax-rates',
    permission: 'tax_rate',
    searchField: 'name',
    orderBy: 'rate',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(100)", example: 'KDV %20' },
      { name: 'rate', tsType: 'number', validator: '@IsNumber()\n  @Min(0)\n  @Max(100)', example: 20 },
      { name: 'isDefault', tsType: 'boolean', validator: '@IsBoolean()', optional: true, default: 'false' },
      { name: 'isActive', tsType: 'boolean', validator: '@IsBoolean()', optional: true, default: 'true' },
    ],
  },
  {
    dir: 'cost-centers',
    prismaModel: 'CostCenter',
    prismaDelegate: 'costCenter',
    className: 'CostCenters',
    route: 'cost-centers',
    tag: 'cost-centers',
    permission: 'cost_center',
    searchField: 'name',
    orderBy: 'code',
    fields: [
      { name: 'code', tsType: 'string', validator: "@IsString()\n  @MaxLength(50)", example: 'CC-100' },
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Satış Departmanı' },
      { name: 'parentId', tsType: 'string', validator: '@IsUUID()', optional: true },
      { name: 'isActive', tsType: 'boolean', validator: '@IsBoolean()', optional: true, default: 'true' },
    ],
  },
  {
    dir: 'expense-categories',
    prismaModel: 'ExpenseCategory',
    prismaDelegate: 'expenseCategory',
    className: 'ExpenseCategories',
    route: 'expense-categories',
    tag: 'expense-categories',
    permission: 'expense',
    searchField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Kira' },
      { name: 'parentId', tsType: 'string', validator: '@IsUUID()', optional: true },
    ],
  },
  {
    dir: 'income-categories',
    prismaModel: 'IncomeCategory',
    prismaDelegate: 'incomeCategory',
    className: 'IncomeCategories',
    route: 'income-categories',
    tag: 'income-categories',
    permission: 'income',
    searchField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Faiz Geliri' },
    ],
  },
  {
    dir: 'departments',
    prismaModel: 'Department',
    prismaDelegate: 'department',
    className: 'Departments',
    route: 'departments',
    tag: 'departments',
    permission: 'employee',
    searchField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Muhasebe' },
      { name: 'parentId', tsType: 'string', validator: '@IsUUID()', optional: true },
    ],
  },
  {
    dir: 'job-positions',
    prismaModel: 'JobPosition',
    prismaDelegate: 'jobPosition',
    className: 'JobPositions',
    route: 'job-positions',
    tag: 'job-positions',
    permission: 'employee',
    searchField: 'title',
    orderBy: 'title',
    fields: [
      { name: 'title', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Muhasebe Uzmanı' },
      { name: 'departmentId', tsType: 'string', validator: '@IsUUID()', optional: true },
    ],
  },
  // NOTE: payment-methods is intentionally hand-written (uses the Prisma
  // PaymentMethodType enum) and is excluded from scaffolding.
  {
    dir: 'banks',
    prismaModel: 'Bank',
    prismaDelegate: 'bank',
    className: 'Banks',
    route: 'banks',
    tag: 'banks',
    permission: 'bank_account',
    searchField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'name', tsType: 'string', validator: "@IsString()\n  @MaxLength(150)", example: 'Ziraat Bankası' },
      { name: 'swiftCode', tsType: 'string', validator: "@IsString()\n  @MaxLength(20)", optional: true },
    ],
  },
];

const validatorImports = new Set([
  'IsString',
  'IsBoolean',
  'IsOptional',
  'IsUUID',
  'IsNumber',
  'IsEnum',
  'Min',
  'Max',
  'MaxLength',
]);

function dtoFile(spec) {
  const createProps = spec.fields
    .map((f) => {
      const decorators = [];
      decorators.push(
        `@ApiProperty${f.optional ? 'Optional' : ''}(${f.example !== undefined ? `{ example: ${JSON.stringify(f.example)} }` : ''})`,
      );
      if (f.optional) decorators.push('@IsOptional()');
      decorators.push(f.validator);
      const decoratorBlock = decorators.map((d) => `  ${d}`).join('\n');
      return `${decoratorBlock}\n  ${f.name}${f.optional ? '?' : '!'}: ${f.tsType};`;
    })
    .join('\n\n');

  const usedValidators = new Set();
  for (const validatorName of validatorImports) {
    const pattern = new RegExp(`@${validatorName}\\(`);
    const usedInField = spec.fields.some((f) => pattern.test(f.validator));
    const usedOptional = validatorName === 'IsOptional' && spec.fields.some((f) => f.optional);
    if (usedInField || usedOptional) {
      usedValidators.add(validatorName);
    }
  }
  const hasOptional = spec.fields.some((f) => f.optional);
  const swaggerImports = ['ApiProperty', 'PartialType'];
  if (hasOptional) {
    swaggerImports.splice(1, 0, 'ApiPropertyOptional');
  }

  return `import { ${swaggerImports.join(', ')} } from '@nestjs/swagger';
import { ${[...usedValidators].sort().join(', ')} } from 'class-validator';

export class Create${spec.prismaModel}Dto {
${createProps}
}

export class Update${spec.prismaModel}Dto extends PartialType(Create${spec.prismaModel}Dto) {}
`;
}

function serviceFile(spec) {
  const createData = spec.fields
    .map((f) => {
      if (f.default !== undefined && f.optional) {
        return `        ${f.name}: dto.${f.name} ?? ${f.default},`;
      }
      return `        ${f.name}: dto.${f.name},`;
    })
    .join('\n');

  return `import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { Create${spec.prismaModel}Dto, Update${spec.prismaModel}Dto } from './dto/${spec.dir}.dto';

type Entity = Prisma.${spec.prismaModel}GetPayload<Record<string, never>>;

@Injectable()
export class ${spec.className}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: Create${spec.prismaModel}Dto): Promise<Entity> {
    return this.prisma.${spec.prismaDelegate}.create({
      data: {
        companyId,
${createData}
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.${spec.prismaModel}WhereInput = {
      companyId,
      ...(query.search ? { ${spec.searchField}: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.${spec.prismaDelegate}.findMany({
        where,
        orderBy: { ${spec.orderBy}: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.${spec.prismaDelegate}.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.${spec.prismaDelegate}.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('${spec.prismaModel} not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: Update${spec.prismaModel}Dto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.${spec.prismaDelegate}.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.${spec.prismaDelegate}.delete({ where: { id } });
  }
}
`;
}

function controllerFile(spec) {
  return `import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ${spec.className}Service } from './${spec.dir}.service';
import { Create${spec.prismaModel}Dto, Update${spec.prismaModel}Dto } from './dto/${spec.dir}.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('${spec.tag}')
@ApiBearerAuth()
@Controller('${spec.route}')
export class ${spec.className}Controller {
  constructor(private readonly service: ${spec.className}Service) {}

  @Post()
  @RequirePermissions({ resource: '${spec.permission}', action: 'create' })
  @Audit('create', '${spec.prismaModel}')
  @ApiOperation({ summary: 'Create ${spec.prismaModel}' })
  create(@TenantCompanyId() companyId: string, @Body() dto: Create${spec.prismaModel}Dto) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: '${spec.permission}', action: 'read' })
  @ApiOperation({ summary: 'List ${spec.prismaModel} records' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: '${spec.permission}', action: 'read' })
  @ApiOperation({ summary: 'Get ${spec.prismaModel} by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: '${spec.permission}', action: 'update' })
  @Audit('update', '${spec.prismaModel}')
  @ApiOperation({ summary: 'Update ${spec.prismaModel}' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update${spec.prismaModel}Dto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: '${spec.permission}', action: 'delete' })
  @Audit('delete', '${spec.prismaModel}')
  @ApiOperation({ summary: 'Delete ${spec.prismaModel}' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(companyId, id);
  }
}
`;
}

function moduleFile(spec) {
  return `import { Module } from '@nestjs/common';
import { ${spec.className}Controller } from './${spec.dir}.controller';
import { ${spec.className}Service } from './${spec.dir}.service';

@Module({
  controllers: [${spec.className}Controller],
  providers: [${spec.className}Service],
  exports: [${spec.className}Service],
})
export class ${spec.className}Module {}
`;
}

for (const spec of specs) {
  const dir = join(MODULES_DIR, spec.dir);
  mkdirSync(join(dir, 'dto'), { recursive: true });
  writeFileSync(join(dir, 'dto', `${spec.dir}.dto.ts`), dtoFile(spec));
  writeFileSync(join(dir, `${spec.dir}.service.ts`), serviceFile(spec));
  writeFileSync(join(dir, `${spec.dir}.controller.ts`), controllerFile(spec));
  writeFileSync(join(dir, `${spec.dir}.module.ts`), moduleFile(spec));
  console.log(`generated ${spec.dir}`);
}
