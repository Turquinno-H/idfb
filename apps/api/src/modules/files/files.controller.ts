import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  @RequirePermissions({ resource: 'attachment', action: 'create' })
  @Audit('upload', 'Attachment')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a file to object storage and register an attachment',
  })
  upload(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.service.upload(companyId, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      entityType,
      entityId,
      userId: user.userId,
    });
  }

  @Get()
  @RequirePermissions({ resource: 'attachment', action: 'read' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiOperation({ summary: 'List attachments' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.service.findAll(companyId, query, entityType, entityId);
  }

  @Get(':id/download-url')
  @RequirePermissions({ resource: 'attachment', action: 'read' })
  @ApiOperation({ summary: 'Get a presigned download URL for an attachment' })
  downloadUrl(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getDownloadUrl(companyId, id);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'attachment', action: 'delete' })
  @Audit('delete', 'Attachment')
  @ApiOperation({ summary: 'Delete an attachment' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
