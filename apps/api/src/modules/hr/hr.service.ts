import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PayrollStatus, Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { resolveCompanyCurrency } from '../../common/util/company-currency';
import { calculatePayroll } from './payroll-calculator';
import {
  CreateAttendanceDto,
  CreateEmployeeDto,
  CreatePayrollDto,
  UpdateEmployeeDto,
} from './dto/hr.dto';

type EmployeeEntity = Prisma.EmployeeGetPayload<{
  include: { department: true; position: true; branch: true; currency: true };
}>;

const EMPLOYEE_INCLUDE = {
  department: true,
  position: true,
  branch: true,
  currency: true,
} satisfies Prisma.EmployeeInclude;

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Employees ----

  async createEmployee(companyId: string, dto: CreateEmployeeDto): Promise<EmployeeEntity> {
    const employeeNumber =
      dto.employeeNumber ??
      (await nextDocumentNumber(
        this.prisma.employee as unknown as {
          count: (args: { where: { companyId: string } }) => Promise<number>;
        },
        companyId,
        'PER',
      ));
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);

    return this.prisma.employee.create({
      data: {
        companyId,
        employeeNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        nationalId: dto.nationalId,
        email: dto.email,
        phone: dto.phone,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        hireDate: new Date(dto.hireDate),
        baseSalary: dto.baseSalary,
        currencyId,
      },
      include: EMPLOYEE_INCLUDE,
    });
  }

  async listEmployees(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<EmployeeEntity>> {
    const where: Prisma.EmployeeWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: EMPLOYEE_INCLUDE,
        orderBy: { firstName: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.employee.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getEmployee(companyId: string, id: string): Promise<EmployeeEntity> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: EMPLOYEE_INCLUDE,
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async updateEmployee(
    companyId: string,
    id: string,
    dto: UpdateEmployeeDto,
  ): Promise<EmployeeEntity> {
    await this.getEmployee(companyId, id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        nationalId: dto.nationalId,
        email: dto.email,
        phone: dto.phone,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        baseSalary: dto.baseSalary,
        currencyId: dto.currencyId,
      },
      include: EMPLOYEE_INCLUDE,
    });
  }

  // ---- Payroll ----

  async createPayroll(
    companyId: string,
    dto: CreatePayrollDto,
  ): Promise<Prisma.PayrollGetPayload<{ include: { employee: true } }>> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const period = startOfMonth(new Date(dto.period));
    const grossSalary = dto.grossSalary ?? Number(employee.baseSalary);

    const breakdown = calculatePayroll({
      grossSalary,
      bonuses: dto.bonuses,
      otherDeductions: dto.otherDeductions,
    });

    const existing = await this.prisma.payroll.findUnique({
      where: { employeeId_period: { employeeId: dto.employeeId, period } },
    });
    if (existing) {
      throw new BadRequestException('Payroll for this employee and period already exists');
    }

    return this.prisma.payroll.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        period,
        grossSalary: breakdown.grossSalary,
        incomeTax: breakdown.incomeTax + breakdown.stampTax,
        sgkEmployee: breakdown.sgkEmployee,
        sgkEmployer: breakdown.sgkEmployer,
        unemploymentInsurance: breakdown.unemploymentInsurance,
        otherDeductions: breakdown.otherDeductions,
        bonuses: breakdown.bonuses,
        netSalary: breakdown.netSalary,
        status: PayrollStatus.DRAFT,
      },
      include: { employee: true },
    });
  }

  async listPayrolls(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Prisma.PayrollGetPayload<{ include: { employee: true } }>>> {
    const where: Prisma.PayrollWhereInput = { companyId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({
        where,
        include: { employee: true },
        orderBy: { period: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.payroll.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async approvePayroll(
    companyId: string,
    id: string,
  ): Promise<Prisma.PayrollGetPayload<{ include: { employee: true } }>> {
    const payroll = await this.prisma.payroll.findFirst({ where: { id, companyId } });
    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }
    return this.prisma.payroll.update({
      where: { id },
      data: { status: PayrollStatus.APPROVED },
      include: { employee: true },
    });
  }

  // ---- Attendance ----

  async recordAttendance(
    companyId: string,
    dto: CreateAttendanceDto,
  ): Promise<Prisma.AttendanceGetPayload<Record<string, never>>> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const date = new Date(dto.date);
    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: dto.employeeId, date } },
      create: {
        companyId,
        employeeId: dto.employeeId,
        date,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
        note: dto.note,
      },
      update: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
        note: dto.note,
      },
    });
  }

  async listAttendance(
    companyId: string,
    employeeId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Prisma.AttendanceGetPayload<Record<string, never>>>> {
    const where: Prisma.AttendanceWhereInput = { companyId, employeeId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }
}
