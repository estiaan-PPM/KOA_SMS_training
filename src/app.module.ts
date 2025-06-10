import { Module } from '@nestjs/common';
import { StudentsModule } from './students/student.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot:'/',
        }),
        StudentsModule, 
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}