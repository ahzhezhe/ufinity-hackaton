import { Sequelize } from 'sequelize';
import { env } from './env';

let sequelize: Sequelize;

if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.db.storage,
    logging: env.nodeEnv === 'development' ? console.log : false,
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
    logging: env.nodeEnv === 'development' ? console.log : false,
  });
}

export { sequelize };
