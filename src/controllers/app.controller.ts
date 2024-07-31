import {Body, Controller, Delete, Get, Patch, Post, Query, Request, UseGuards} from "@nestjs/common";
import {AppService} from "../services/app.service";
import {Roles} from "../utils/validators";
import {ApiTags} from "@nestjs/swagger";
import {Role} from "../models/schemas/enums/role.enum";
import {RoleAuthGuard} from "../configs/guards/role-auth.guard";
import {Competitions} from "../models/schemas/competition.schema";
import {Status} from "../models/schemas/enums/status.enum";

@Controller('api/v1/competition')
@ApiTags("App")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Post('create')
  async createCompetition(@Request() hReq, @Body() req: Competitions) {
    return await this.appService.create(hReq.user.jti, req);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleAuthGuard)
  @Get('admin/dashboard')
  async findAllCompetitions(@Request() req,@Query('page') page: number = 1,
                @Query('limit') limit: number = 10,
                            @Query('status') status: string = 'all') {
    return await this.appService.findAllCompetitions(page, limit, status);
  }

  @Roles(Role.User)
  @UseGuards(RoleAuthGuard)
  @Get('user/dashboard')
  async findCompetitionsByUser(@Request() req,@Query('page') page: number = 1,
                            @Query('limit') limit: number = 10,
                            @Query('status') status: string = 'all') {
    return await this.appService.findCompetitionByUser(req.user.jti, page, limit, status);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Get("show-details")
  async findCompetitionById(@Query('id') id: string) {
    return await this.appService.findCompetitionById(id);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Delete("remove")
  async deleteCompetitionById(@Query('id') id: string) {
    return await this.appService.removeCompetition(id);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleAuthGuard)
  @Patch("admin/approve-competition")
  async approveOrRejectCompetition(@Request() hReq, @Query('id') id: string, @Query('isApproved') isApproved: string) {
    return await this.appService.approvedCompetition(hReq.user.jti, id, isApproved);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleAuthGuard)
  @Patch("admin/update-competition-status")
  async updateCompetitionStatus(@Request() hReq, @Query('id') id: string, @Query('status') status: Status) {
    return await this.appService.updateCompetitionStatus(hReq.user.jti, id, status);
  }


}
