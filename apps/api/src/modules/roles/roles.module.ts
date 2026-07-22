import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, UsersService],
  exports: [RolesService, UsersService],
})
export class RolesModule {}
