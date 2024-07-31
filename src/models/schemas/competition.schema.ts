import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ApiProperty} from "@nestjs/swagger";
import {GenericObj} from "./generic.schema";
import {IsNotEmpty} from "class-validator";

@Schema()
export class Competitions extends GenericObj{
    @IsNotEmpty()
    @Prop({ required: true })
    @ApiProperty()
    organizerName: string;
    @Prop()
    @ApiProperty()
    description: string;
    @IsNotEmpty()
    @Prop()
    @ApiProperty()
    competitionName: string;
    @Prop()
    @ApiProperty()
    smsMsg: string;
    @Prop()
    @ApiProperty()
    smsRefId: string;
    @Prop()
    @ApiProperty()
    isPaymentAllowed: boolean;
    @Prop()
    @ApiProperty()
    isVotesDisplayable: boolean;
    @IsNotEmpty()
    @Prop()
    @ApiProperty()
    organizerAmtShare: string;
    @IsNotEmpty()
    @Prop()
    @ApiProperty()
    appAmtCharge: string;
    @IsNotEmpty()
    @Prop()
    @ApiProperty()
    voteAmount: string;
    @Prop()
    @ApiProperty({ type: ()=> [Categories] })
    categories: Categories[]
    @Prop()
    @ApiProperty()
    startDate: Date;
    @Prop()
    @ApiProperty()
    endDate: Date;
}

export class Categories {
    @IsNotEmpty()
    @Prop({ unique: true })
    @ApiProperty()
    categoryRef: string;
    @IsNotEmpty()
    @Prop({ required: true })
    @ApiProperty()
    name: string;
    @Prop()
    @ApiProperty()
    description: string;
    @Prop()
    @ApiProperty()
    totalContestants: number;
    @Prop()
    @ApiProperty()
    totalVotes: number;
}

@Schema()
export class Contestants {
    @IsNotEmpty()
    @Prop({})
    @ApiProperty()
    categoryRef: string;
    @IsNotEmpty()
    @Prop({ unique: true, required: true })
    @ApiProperty()
    name: string;
    @Prop()
    @ApiProperty()
    description: string;
    @Prop({ unique: true })
    @ApiProperty()
    voteCode: string;
    @Prop()
    @ApiProperty()
    totalVotes: number;
    @Prop()
    @ApiProperty()
    image: string;
    @Prop()
    userId: string;
}


export const CompetitionSchema = SchemaFactory.createForClass(Competitions);
export const ContestantSchema = SchemaFactory.createForClass(Contestants);


