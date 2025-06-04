import { Module } from '@nestjs/common';
import { StudentsModule } from './students/student.module';
import { CqrsModule } from '@nestjs/cqrs';
// import { ConfigModule } from '@nestjs/config';
// import * as Joi from '@hapi/joi';
// import { DatabaseModule } from './database/database.module';

@Module({
    imports: [
        StudentsModule, 
        // ConfigModule.forRoot({
        //     validationSchema: Joi.object({
        //         POSTGRES_HOST: Joi.string().required(),
        //         POSTGRES_PORT: Joi.number().required(),
        //         POSTGRES_USER: Joi.string().required(),
        //         POSTGRES_PASSWORD: Joi.string().required(),
        //         POSTGRES_DB: Joi.string().required(),
        //         Port: Joi.number(),
        //     })
        // }),
        // DatabaseModule,
        CqrsModule.forRoot()
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}