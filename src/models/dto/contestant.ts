import {Contestants} from "../schemas/competition.schema";
import {ApiProperty} from "@nestjs/swagger";

export class ContestantObj {
    @ApiProperty({ type: () => [Contestants] })
    contestants: Contestants[];
}