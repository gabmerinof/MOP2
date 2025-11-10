import { EntityManager, EntityName, MikroORM, RequestContext } from '@mikro-orm/postgresql';
import { initORMConfig } from '../mikro-orm.config';

interface Services {
    orm: MikroORM;
    em: EntityManager;
}

class DatabaseMikro {
    static servicesCache?: Services;

    static async Initialize() {
        const orm = await initORMConfig();
        
        DatabaseMikro.servicesCache = {
            orm,
            em: orm.em
        };
    }

    static getServices() {
        return DatabaseMikro.servicesCache;
    }

    static getRepository<T>(ent: T) {
        return DatabaseMikro.servicesCache?.em.getRepository(ent as EntityName<object>);
    }
}

export { DatabaseMikro, Services };