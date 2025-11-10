import { MikroORM, NullCacheAdapter, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { config } from './config/config';

export const initORMConfig = async () => {
  return await MikroORM.init({
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    dbName: config.DB,
    driver: PostgreSqlDriver,
    host: config.HOST,
    port: config.PORT,
    user: config.USER,
    password: config.PASSWORD,
    resultCache: { adapter: NullCacheAdapter, expiration: 0 },
    metadataProvider: TsMorphMetadataProvider,
    migrations: {
      path: './dist/migrations',
      pathTs: './src/migrations',
    },
    extensions: [],
    debug: process.env["NODE_ENV"] !== 'production'
  });
};