import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import  config from 'config'

async function bootstrap() {
  const logger = new Logger("bootstrap")

  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const port = process.env.PORT || config.get<number>('server.port')

  await app.listen(port)
  logger.log(`running on port ${port}`)

}
bootstrap();
