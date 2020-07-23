import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, IUsers } from './users.schema';
import { JwtStrategy } from './jwt/auth';
import * as config from 'config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    //create token
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: process.env.EXP_JWT || jwtConfig.expiresIn,
      },
    }),
    //create collection
    MongooseModule.forFeature([{ name: "Users", schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    JwtStrategy,//activate Bearer
    UsersService,
  ],
  exports: [
      JwtStrategy,
      PassportModule,
    ],
})
export class UsersModule {}
