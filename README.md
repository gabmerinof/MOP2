# API de Gestión de Puntos de GeoReferencia
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

API RESTful para gestionar puntos de georeferencia en una aplicación de tráfico.

## Características

- ✅ Registro y autenticación de usuarios
- ✅ CRUD completo de puntos georeferenciados
- ✅ Filtrado por proximidad usando PostGIS
- ✅ Validación de datos y manejo de errores
- ✅ Autenticación JWT
- ✅ Arquitectura con Repository y Service patterns

## Tecnologías

- Node.js + TypeScript
- Express.js
- PostgreSQL + PostGIS
- MikroORM
- JWT para autenticación
- Joi para validación

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`
4. Crear base de datos PostgreSQL con extensión PostGIS
5. Iniciar servidor: `npm run dev`
```bash
git clone https://github.com/gabmerinof/MOP.git
cd MOP

npm install
npm run dev
```
## Modificar archivo .env
```text
# Database Configuration
DB_HOST=postgresql-traffic.xxxxx.net
DB_PORT=5432
DB_NAME=xxxx_mop
DB_USER=xxxxx
DB_PASSWORD=xxxxx

# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6123450abcdef0987654321
JWT_EXPIRES_IN=24

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Script creación de tablas Postgresql
```sql
  -- Creación de las extensiones geoferenciales
  CREATE EXTENSION postgis;
  CREATE EXTENSION postgis_raster;
  CREATE EXTENSION postgis_sfcgal;
  CREATE EXTENSION fuzzystrmatch;
  CREATE EXTENSION address_standardizer;
  CREATE EXTENSION address_standardizer_data_us;
  CREATE EXTENSION postgis_tiger_geocoder;
  CREATE EXTENSION postgis_topology;

  -- Tabla de usuarios
  CREATE TABLE IF NOT EXISTS users (
      userid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE
  );
  
  -- Tabla de puntos geográficos
  CREATE TABLE IF NOT EXISTS geo_points (
      geopointid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('accidente', 'congestión', 'obstrucción', 'otro')),
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  	  updated_at TIMESTAMP WITH TIME ZONE,
      userid UUID REFERENCES users(userid) ON DELETE CASCADE,
      geom GEOMETRY(Point, 4326)
  );
  
  -- Índices para mejor performance
  CREATE INDEX IF NOT EXISTS idx_geo_points_geom ON geo_points USING GIST(geom);
  CREATE INDEX IF NOT EXISTS idx_geo_points_type ON geo_points(type);
  CREATE INDEX IF NOT EXISTS idx_geo_points_user_id ON geo_points(userid);
  CREATE INDEX IF NOT EXISTS idx_geo_points_created_at ON geo_points(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Puntos GeoReferenciados
- `GET /points` - Listar puntos (con filtros opcionales)
- `GET /points/:geoPointId` - Obtener punto por ID
- `POST /points` - Crear punto (requiere autenticación)
- `PUT /points/:geoPointId` - Actualizar punto (solo creador)
- `DELETE /points/:geoPointId` - Eliminar punto (solo creador)
- `GET /points/user/my-points/:userid` - Obtener puntos del usuario

### Filtros de Proximidad
- `GET /points?lat=40.7128&long=-74.0060&radius=10` - Puntos en 10km de radio
- `GET /points?type=accidente` - Filtrar por tipo

## Estructura de la Arquitectura
```text
MOP/
├── MOP/
│   ├── src/
│   │   ├── config/         # Configuraciones (CORS, DATABASE)
│   │   ├── controllers/    # Lógica de endpoints
│   │   ├── middleware/     # Middlewares (auth, responseformat, validations)
│   │   ├── models/         # Interfaces TypeScript - sequelize
│   │   ├── repositories/   # Acceso a datos
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   ├── types/          # Interfaces TypeScript
│   │   └── app.ts          # Punto de entrada
│   ├── .env
│   ├── environment.d.ts
│   ├── package.json
└── └── tsconfig.json
```

## Ejemplos consumo EndPoints (Postman)
### Registrar usuario
<img width="651" height="656" alt="image" src="https://github.com/user-attachments/assets/4d187e95-229f-4e35-b1b5-eb4d5bbc569f" />

### Obtener token
<img width="816" height="803" alt="image" src="https://github.com/user-attachments/assets/84dbce98-0fe1-43fb-ad19-7f2a3158dc96" />

## Obtener un punto GeoReferencial
* Auth Type: se elige Bearer Tokem
* Copiar el token del endpoint de login y se le asigna en la caja de Token en Postman
<img width="837" height="925" alt="image" src="https://github.com/user-attachments/assets/315b2901-94b1-439a-ae95-67d3e7ed3c29" />

## Creación de un punto GeoReferencial
* Auth Type: se elige Bearer Tokem
* Copiar el token del endpoint de login y se le asigna en la caja de Token en Postman
<img width="700" height="925" alt="image" src="https://github.com/user-attachments/assets/29923851-fe2a-4a6a-80df-a350d1a729c1" />

## Actualizar un punto GeoReferencial
* Auth Type: se elige Bearer Tokem
* Copiar el token del endpoint de login y se le asigna en la caja de Token en Postman
* Agregar el id a actualizar en la URL
<img width="691" height="907" alt="image" src="https://github.com/user-attachments/assets/4f569f8f-860a-4700-9bdb-6f66179b63c9" />

## Eliminar un punto GeoReferencial
* Auth Type: se elige Bearer Tokem
* Copiar el token del endpoint del login y se le asigna en la caja de Token en Postman
* Agregar el Id a eliminar en la URL
<img width="668" height="640" alt="image" src="https://github.com/user-attachments/assets/478501fb-b603-4247-9f3a-72b75d5e8a00" />

## Ver todos mis puntos GeoReferenciales
* Auth Type: se elige Bearer Tokem
* Copiar el token del endpoint de login y se le asigna en la caja de Token en Postman
* Agregar el Id del usuario en la URL
<img width="832" height="922" alt="image" src="https://github.com/user-attachments/assets/8f10f482-a1eb-4af5-a48e-1ba70ec728e3" />

## Problemas comunes

Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

Error de compilación TypeScript
```bash
npm run clean
npm run build
```

Problemas de autenticación
* Verificar que el token JWT sea válido
* Confirmar que el usuario exista en la base de datos postgres
* Confirmar si la base de datos postgres es on-premise o cloud y luego cambiar el environment del proyecto (.env), ejemplo:
  ```text
    # Database Configuration
    DB_HOST=postgresql-traffic.xxxxx.net
    DB_PORT=5432
    DB_NAME=xxxx_mop
    DB_USER=xxxxxxxxx
    DB_PASSWORD=xxxxxxxxx
  ```
