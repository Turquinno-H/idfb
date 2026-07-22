import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HrService } from './hr.service';
import {
  CreateAttendanceDto,
  CreateEmployeeDto,
  CreatePayrollDto,
  UpdateEmployeeDto,
} from './dto/hr.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('hr')
@ApiBearerAuth()
@Controller()
export class HrController {
  constructor(private readonly service: HrService) {}

  // Employees
  @Post('employees')
  @RequirePermissions({ resource: 'employee', action: 'create' })
  @Audit('create', 'Employee')
  @ApiOperation({ summary: 'Create an employee' })
  createEmployee(@TenantCompanyId() companyId: string, @Body() dto: CreateEmployeeDto) {
    return this.service.createEmployee(companyId, dto);
  }

  @Get('employees')
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'List employees' })
  listEmployees(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listEmployees(companyId, query);
  }

  @Get('employees/:id')
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'Get an employee by id' })
  getEmployee(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getEmployee(companyId, id);
  }

  @Patch('employees/:id')
  @RequirePermissions({ resource: 'employee', action: 'update' })
  @Audit('update', 'Employee')
  @ApiOperation({ summary: 'Update an employee' })
  updateEmployee(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.service.updateEmployee(companyId, id, dto);
  }

  // Payroll
  @Post('payrolls')
  @RequirePermissions({ resource: 'payroll', action: 'create' })
  @Audit('create', 'Payroll')
  @ApiOperation({ summary: 'Run payroll for an employee/period (Turkish statutory deductions)' })
  createPayroll(@TenantCompanyId() companyId: string, @Body() dto: CreatePayrollDto) {
    return this.service.createPayroll(companyId, dto);
  }

  @Get('payrolls')
  @RequirePermissions({ resource: 'payroll', action: 'read' })
  @ApiOperation({ summary: 'List payroll runs' })
  listPayrolls(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listPayrolls(companyId, query);
  }

  @Post('payrolls/:id/approve')
  @RequirePermissions({ resource: 'payroll', action: 'approve' })
  @Audit('approve', 'Payroll')
  @ApiOperation({ summary: 'Approve a payroll run' })
  approvePayroll(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.approvePayroll(companyId, id);
  }

  // Attendance
  @Post('attendance')
  @RequirePermissions({ resource: 'attendance', action: 'create' })
  @Audit('record', 'Attendance')
  @ApiOperation({ summary: 'Record or update attendance for an employee/day' })
  recordAttendance(@TenantCompanyId() companyId: string, @Body() dto: CreateAttendanceDto) {
    return this.service.recordAttendance(companyId, dto);
  }

  @Get('employees/:id/attendance')
  @RequirePermissions({ resource: 'attendance', action: 'read' })
  @ApiOperation({ summary: 'List an employee attendance records' })
  listAttendance(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listAttendance(companyId, id, query);
  }
}
