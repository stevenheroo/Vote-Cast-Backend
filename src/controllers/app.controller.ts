import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards} from "@nestjs/common";
import {AppService} from "../services/app.service";
import {Public, Roles} from "../utils/validators";
import {ApiTags} from "@nestjs/swagger";
import {Role} from "../models/schemas/enums/role.enum";
import {RoleAuthGuard} from "../configs/guards/role-auth.guard";
import {Competitions} from "../models/schemas/competition.schema";
import {Status} from "../models/schemas/enums/status.enum";
import {Ids} from "../models/dto/ids";
import {ContestantObj} from "../models/dto/contestant";

@Controller('api/v1/competition')
@ApiTags("App")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Post('create')
  async createCompetition(@Request() hReq, @Body() req: Competitions) {
    return await this.appService.createCompetition(hReq.user.jti, req);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Patch('update/:id')
  async updateCompetition(@Request() hReq, @Param('id') id: string, @Body() req: Competitions) {
    return await this.appService.updateCompetition(hReq.user.jti, id, req);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Post('add-contestant')
  async addContestants(@Request() hReq, @Body() req: ContestantObj) {
    return await this.appService.addContestants(hReq.user.jti, req);
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
  async findCompetitionsForAUser(@Request() req,@Query('page') page: number = 1,
                            @Query('limit') limit: number = 10,
                            @Query('status') status: string = 'all') {
    return await this.appService.findCompetitionByUser(req.user.jti, page, limit, status);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Get("show-details")
  async findCompetitionById(@Request() hReq, @Query('id') id: string) {
    return await this.appService.findCompetitionById(hReq, id);
  }

  @Public()
  @Get("contestants")
  async findContestants(@Query('categoryRef') categoryRef: string) {
    return await this.appService.findContestants(categoryRef);
  }

  @Public()
  @Get("show-contestant")
  async findContestantById(@Query('id') id: string) {
    return await this.appService.findContestantById(id);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(RoleAuthGuard)
  @Delete("remove")
  async deleteCompetitionById(@Request() hReq, @Body() ids: Ids) {
    return await this.appService.removeCompetition(hReq, ids);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleAuthGuard)
  @Patch("admin/approve-competition")
  async approveOrRejectCompetition(@Request() hReq, @Query('id') id: string, @Query('isApproved') isApproved: string) {
    return await this.appService.approvedCompetition(hReq.user.jti, id, isApproved);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleAuthGuard)
  @Patch("admin/update-status")
  async updateCompetitionStatus(@Request() hReq, @Query('id') id: string, @Query('status') status: Status) {
    return await this.appService.updateCompetitionStatus(hReq.user.jti, id, status);
  }

  @Public()
  @Get("/active")
  async activeCompetitions(@Query('page') page: number = 1,
                           @Query('limit') limit: number = 10) {
    return await this.appService.findActiveCompetitions(page, limit);
  }




}
