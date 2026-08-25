import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga automáticamente el archivo .env
    PrismaModule,
    AccountsModule,
  ],
})
export class AppModule {}