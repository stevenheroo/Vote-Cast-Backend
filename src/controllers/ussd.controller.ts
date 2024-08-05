import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HBUssdCallBackReq } from "src/models/dto/hubtel/callback-ussd.dto";
import { HBussdReq } from "src/models/dto/hubtel/hb-ussd.dto";
import { UssdService } from "src/services/ussd.service";
import { Public } from "src/utils/validators";

@Controller('api/v1/competition')
@ApiTags("App")
export class UssdController {
    constructor(private readonly ussdService: UssdService) {}

    @Public()
    @Post('ussd')
    async createCompetition(@Body() req: HBussdReq) {
        return await this.ussdService.hbUssdCall(req);
    }

    @Public()
    @Post('ussd/callback')
    async complitionUssdCallback(@Body() req: HBUssdCallBackReq) {
        return await this.ussdService.ussdCallback(req);
    }
}