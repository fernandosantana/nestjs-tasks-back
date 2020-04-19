import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import config from 'config'

const dbConfig = config.get<any>("db")

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: dbConfig.type,
    host: process.env.DB_HOST || dbConfig.host,
    port: parseInt(process.env.DB_PORT) || dbConfig.port,
    username: process.env.DB_USERNAME || dbConfig.username,
    password: process.env.DB_PASSWORD || dbConfig.password,
    database: process.env.DB_DATABASE || dbConfig.database,
    entities: [__dirname + "/../**/*.entity.{js,ts}"],
    synchronize: Boolean(process.env.DB_SINCRONIZE) || dbConfig.synchronize
}