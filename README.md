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

## 🏃 Quick Start

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd inventorit

# 2. El archivo .env ya está configurado para localhost
# No necesitas modificar nada para desarrollo local

# 3. Construir e iniciar los servicios
docker compose up -d

# 4. Acceder a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost/api/
```

### Despliegue en Servidor On-Premise

```bash
# 1. Configurar la IP del servidor
cat > .env << EOF
SERVER_IP=10.0.2.10
ALLOWED_ORIGINS=
NODE_ENV=production
EOF

# 2. Construir e iniciar
docker compose up -d

# 3. Acceder desde cualquier máquina en la red
# http://10.0.2.10
```

Para instrucciones detalladas de despliegue, consulta [DEPLOYMENT.md](DEPLOYMENT.md).

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
├── DEPLOYMENT.md           # Guía de despliegue
└── README.md              # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

Todas las variables de entorno se configuran en un **único archivo `.env`** ubicado en la raíz del proyecto.

#### Configuración Inicial

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor preferido
```

#### Variables Principales

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
- `DB_PASSWORD`: Contraseña de PostgreSQL ⚠️ **Cambiar en producción**

**Seguridad:**
- `JWT_SECRET`: Secreto para firmar tokens ⚠️ **Cambiar en producción**
- `JWT_ACCESS_EXPIRATION`: Duración del access token (default: 15m)
- `JWT_REFRESH_EXPIRATION`: Duración del refresh token (default: 7d)
- `DEFAULT_ADMIN_PASSWORD`: Contraseña del admin por defecto ⚠️ **Cambiar después del primer login**
- `MAX_LOGIN_ATTEMPTS`: Intentos de login permitidos (default: 5)
- `BLOCK_DURATION_MINUTES`: Minutos de bloqueo tras intentos fallidos (default: 15)

#### Configuración Automática de CORS

Si `ALLOWED_ORIGINS` está vacío, el sistema automáticamente permite:
- `http://${SERVER_IP}`
- `http://${SERVER_IP}:80`
- `http://${SERVER_IP}:3000`

Para múltiples orígenes específicos:
```bash
ALLOWED_ORIGINS=http://10.0.2.10,http://otro-servidor.com
```

## 🔐 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `Adm1n_Secur3!2025`

⚠️ **IMPORTANTE**: Cambiar inmediatamente en producción.

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

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

## 🧪 Verificación

```bash
# Verificar que todos los servicios están corriendo
docker compose ps

# Ver logs
docker compose logs -f backend

# Probar la API
curl http://localhost/api/

# Verificar CORS
curl -H "Origin: http://10.0.2.10" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost/api/auth/login -v
```

## 🛠️ Comandos Útiles

```bash
# Detener servicios
docker compose down

# Reiniciar un servicio
docker compose restart backend

# Ver logs en tiempo real
docker compose logs -f

# Reconstruir imágenes
docker compose build --no-cache

# Backup de base de datos
docker compose exec db pg_dump -U postgres inventory_db > backup.sql

# Restaurar base de datos
docker compose exec -T db psql -U postgres inventory_db < backup.sql
```

## 🌐 Acceso desde la Red

Para acceder desde otras máquinas:

1. **Configurar IP estática** en el servidor
2. **Actualizar `.env`** con la IP correcta
3. **Configurar firewall** para permitir puerto 80
4. **Reiniciar servicios**: `docker compose restart`

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para detalles.

## 🐛 Troubleshooting

### CORS Error
```bash
# Verificar configuración CORS en logs
docker compose logs backend | grep CORS

# Actualizar ALLOWED_ORIGINS si es necesario
```

### No puede conectar a la BD
```bash
# Verificar que la BD está corriendo
docker compose ps db

# Reiniciar BD
docker compose restart db
```

### Puerto en uso
```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80

# Cambiar puerto en docker-compose.yml si es necesario
```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para más soluciones.

## 📚 Documentación

- [Guía de Despliegue Completa](DEPLOYMENT.md)
- [Configuración de Variables de Entorno](.env.example)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Soporte

Para problemas o preguntas:
1. Revisar [DEPLOYMENT.md](DEPLOYMENT.md)
2. Verificar logs: `docker compose logs`
3. Abrir un issue en el repositorio
