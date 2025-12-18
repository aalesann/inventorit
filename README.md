# Sistema de Inventario de TI

Sistema completo de gestión de inventario de equipos informáticos con autenticación de usuarios, gestión de activos en tiempo real mediante WebSockets, y arquitectura basada en microservicios con Docker.

## 🚀 Características

- **Autenticación de Usuarios**: Sistema de login con roles (admin/usuario)
- **Gestión de Activos**: CRUD completo para equipos informáticos
- **Categorías**: PC de Escritorio, Notebooks, Monitores, UPS, Impresoras
- **Actualizaciones en Tiempo Real**: WebSockets con Socket.IO
- **Arquitectura de Microservicios**: NGINX, Node.js/Express, React, PostgreSQL
- **Dockerizado**: Despliegue fácil con Docker Compose
- **CORS Configurable**: Preparado para despliegue on-premise

## 📋 Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4 GB RAM mínimo
- 20 GB espacio en disco

## 🚀 Instalación y Despliegue

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd inventorit
```

### 2. Configurar Variables de Entorno

Todas las variables de entorno se configuran en un **único archivo `.env`** ubicado en la raíz del proyecto.

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor preferido
```

#### Configuración para Desarrollo Local

El archivo `.env.example` ya tiene valores por defecto para desarrollo. Puedes usarlo tal cual:

```bash
NODE_ENV=development
SERVER_IP=localhost
ALLOWED_ORIGINS=
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=your_secure_db_password_here
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
DEFAULT_ADMIN_PASSWORD=Adm1n_Secur3!2025
MAX_LOGIN_ATTEMPTS=5
BLOCK_DURATION_MINUTES=15
```

#### Configuración para Producción

Para despliegue en servidor on-premise, edita el archivo `.env`:

```bash
NODE_ENV=production
SERVER_IP=10.0.2.x  # IP real del servidor
ALLOWED_ORIGINS=    # Dejar vacío para auto-configuración
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI  # ⚠️ Cambiar
JWT_SECRET=TU_JWT_SECRET_AQUI        # ⚠️ Generar con: openssl rand -base64 32
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
DEFAULT_ADMIN_PASSWORD=TU_PASSWORD_ADMIN_SEGURO  # ⚠️ Cambiar
MAX_LOGIN_ATTEMPTS=5
BLOCK_DURATION_MINUTES=15
```

> **💡 Tip**: Genera un JWT secret seguro con: `openssl rand -base64 32`

#### Variables de Entorno Explicadas

**Servidor y Red:**
- `SERVER_IP`: IP del servidor (localhost para desarrollo, IP real para producción)
- `ALLOWED_ORIGINS`: Orígenes CORS permitidos (opcional, separados por comas)
- `NODE_ENV`: Entorno de ejecución (development | production)
- `PORT`: Puerto del backend (default: 3000)

**Base de Datos:**
- `DB_HOST`: Host de PostgreSQL (default: db)
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL

**Seguridad:**
- `JWT_SECRET`: Secreto para firmar tokens
- `JWT_ACCESS_EXPIRATION`: Duración del access token (default: 15m)
- `JWT_REFRESH_EXPIRATION`: Duración del refresh token (default: 7d)
- `DEFAULT_ADMIN_PASSWORD`: Contraseña del admin por defecto
- `MAX_LOGIN_ATTEMPTS`: Intentos de login permitidos (default: 5)
- `BLOCK_DURATION_MINUTES`: Minutos de bloqueo tras intentos fallidos (default: 15)



### 3. Iniciar los Servicios

```bash
# Construir e iniciar en segundo plano
docker compose up -d

# O ver logs en tiempo real
docker compose up
```

### 4. Verificar el Despliegue

```bash
# Ver estado de los servicios
docker compose ps

# Deberías ver algo como:
# NAME                       STATUS              PORTS
# inventorit-db-1            Up 2 minutes        5432/tcp
# inventorit-backend-1       Up 2 minutes        3000/tcp
# inventorit-frontend-1      Up 2 minutes        8080/tcp
# inventorit-nginx-1         Up 2 minutes        0.0.0.0:80->80/tcp
```

### 5. Acceder a la Aplicación

- **Desarrollo local**: http://localhost
- **Servidor on-premise**: http://10.0.2.x (usar la IP configurada)
- **API Backend**: http://localhost/api/

## 🔐 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `Adm1n_Secur3!2025`

⚠️ **IMPORTANTE**: Cambiar inmediatamente después del primer login en producción.



## 🏗️ Arquitectura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    NGINX    │ ← Puerto 80 (Gateway)
│  (Gateway)  │
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       ↓                 ↓                 ↓
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Frontend   │   │   Backend   │   │ PostgreSQL  │
│   (React)   │   │  (Express)  │   │     DB      │
│   Port 80   │   │  Port 3000  │   │  Port 5432  │
└─────────────┘   └──────┬──────┘   └─────────────┘
                         │
                         ↓
                  ┌─────────────┐
                  │  Socket.IO  │
                  │ (WebSocket) │
                  └─────────────┘
```

## 📁 Estructura del Proyecto

```
inventorit/
├── backend/                 # API Node.js/Express (TypeScript)
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── controllers/    # Controladores
│   │   ├── middlewares/    # Middlewares (auth, errors)
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios de negocio
│   │   ├── utils/          # Utilidades (logger)
│   │   └── server.ts       # Punto de entrada
│   ├── dist/               # Código compilado (generado)
│   └── Dockerfile
├── frontend/               # Aplicación React
│   ├── src/
│   └── Dockerfile
├── nginx/                  # Configuración NGINX
│   └── nginx.conf
├── .env                    # Variables de entorno (NO versionar)
├── .env.example            # Plantilla de variables
├── docker-compose.yml      # Orquestación servicios
└── README.md              # Este archivo
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría (admin)

### Inventario
- `GET /api/inventory` - Listar activos
- `POST /api/inventory` - Crear activo
- `GET /api/inventory/:id` - Obtener activo
- `PUT /api/inventory/:id` - Actualizar activo
- `DELETE /api/inventory/:id` - Eliminar activo

### Reportes
- `GET /api/reportes` - Generar reportes

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker compose logs -f backend
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar un servicio
docker compose restart backend

# Reconstruir imágenes
docker compose build --no-cache
docker compose up -d --build

# Backup de base de datos
docker compose exec db pg_dump -U postgres inventory_db > backup.sql

# Restaurar base de datos
docker compose exec -T db psql -U postgres inventory_db < backup.sql

# Ver estado de los servicios
docker compose ps

# Ver uso de recursos
docker stats
```

## 🧪 Verificación

### Probar la API

```bash
# Verificar que el backend está corriendo
curl http://localhost/api/

# Deberías recibir: "Inventory API is running"
```



## 🐛 Troubleshooting



### No puede conectar a la Base de Datos

```bash
# Verificar que la BD está corriendo
docker compose ps db

# Ver logs de la base de datos
docker compose logs db

# Reiniciar BD
docker compose restart db
```

### Puerto 80 en Uso

```bash
# Ver qué proceso usa el puerto 80 (Linux)
sudo lsof -i :80

# Windows
netstat -ano | findstr :80

# Cambiar puerto en docker-compose.yml si es necesario
# O detener el proceso que está usando el puerto
```

### Backend no puede conectar a la BD

```bash
# Verificar conectividad desde el backend
docker compose exec backend ping db

# Verificar variables de entorno
docker compose exec backend env | grep DB_
```

### Frontend muestra página en blanco

```bash
# Ver logs del frontend
docker compose logs frontend

# Ver logs de NGINX
docker compose logs nginx

# Verificar que el frontend se construyó correctamente
docker compose exec frontend ls -la /usr/share/nginx/html
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
