import {Module} from "@nestjs/common";
import {AppService} from "./services/app.service";
import mongooseConfig from "ormconfig";
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule} from "@nestjs/config";
import {User, UserSchema} from "./models/schemas/user.shema";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./utils/validators";
import {PassportModule} from "@nestjs/passport";
import {GenericObj, GenericSchema} from "./models/schemas/generic.schema";
import {AwsService} from "./utils/aws.service";
import {APP_GUARD} from "@nestjs/core";
import {AuthGuards} from "./configs/guards/jwt-auth.guard";
import {AuthService} from "./services/auth.service";
import {LocalStrategy} from "./configs/strategies/local.strategy";
import {GoogleStrategy} from "./configs/strategies/google.strategy";
import {UsersService} from "./services/users.service";
import {UsersController} from "./controllers/users.controller";
import {AppController} from "./controllers/app.controller";
import {AuthController} from "./controllers/auth.controller";
import {Competitions, CompetitionSchema, Contestants, ContestantSchema} from "./models/schemas/competition.schema";
import {MailService} from "./services/mail.service";

@Module({
  imports:
      [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        MongooseModule.forRoot(mongooseConfig.uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Competitions.name, schema: CompetitionSchema },
          { name: GenericObj.name, schema: GenericSchema },
          { name: Contestants.name, schema: ContestantSchema }
        ]),
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: jwtConstants.expireDate },
        }),
        PassportModule,
      ],
  controllers: [UsersController, AppController, AuthController],
  providers: [
    AppService, AwsService, MailService,
    {
      provide: APP_GUARD,
      useClass: AuthGuards
    },
    AuthService, LocalStrategy, GoogleStrategy, UsersService
  ],
})
export class AppModule {
}
