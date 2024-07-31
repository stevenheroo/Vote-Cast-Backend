import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class GenericObj {
  @Prop()
  userId: string;
  @Prop()
  @ApiProperty()
  status: string;
  @Prop()
  @ApiProperty()
  image: string;
  @Prop()
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @Prop()
  approvedAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  createdAt: Date;
}


export const GenericSchema = SchemaFactory.createForClass(GenericObj);


