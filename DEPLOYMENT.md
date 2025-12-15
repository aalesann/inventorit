# Guía de Despliegue - Sistema de Inventario

## Tabla de Contenidos
- [Requisitos del Servidor](#requisitos-del-servidor)
- [Instalación de Docker](#instalación-de-docker)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Verificación](#verificación)
- [Configuración de Red y Firewall](#configuración-de-red-y-firewall)
- [Troubleshooting](#troubleshooting)

## Requisitos del Servidor

### Hardware Mínimo
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 20 GB de espacio libre
- **Red**: Conexión a internet para descarga inicial de imágenes Docker

### Software
- **Sistema Operativo**: Linux (Ubuntu 20.04+ recomendado), Windows Server, o macOS
- **Docker**: versión 20.10 o superior
- **Docker Compose**: versión 2.0 o superior

## Instalación de Docker

### Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt-get update

# Instalar dependencias
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio de Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
sudo docker --version
sudo docker compose version
```

### Windows Server
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Ejecutar el instalador
3. Reiniciar el sistema
4. Verificar instalación abriendo PowerShell:
```powershell
docker --version
docker compose version
```

## Configuración

### 1. Clonar o Copiar el Proyecto
```bash
# Si usas Git
git clone <url-del-repositorio>
cd sys-inventory

# O copiar los archivos al servidor
scp -r sys-inventory/ usuario@10.0.2.x:/opt/sys-inventory/
ssh usuario@10.0.2.x
cd /opt/sys-inventory
```

### 2. Configurar Variables de Entorno

#### Para Desarrollo Local
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# El archivo .env ya está configurado para localhost
```

#### Para Servidor On-Premise
```bash
# Crear archivo .env con la IP del servidor
cat > .env << EOF
SERVER_IP=10.0.2.x
ALLOWED_ORIGINS=
NODE_ENV=production
EOF
```

**Explicación de las variables:**

- `SERVER_IP`: La IP del servidor on-premise (ej: `10.0.2.x`)
  - En desarrollo: `localhost`
  - En producción: La IP real del servidor

- `ALLOWED_ORIGINS`: (Opcional) Lista de orígenes permitidos para CORS, separados por comas
  - Dejar vacío para usar configuración automática basada en `SERVER_IP`
  - Ejemplo: `http://10.0.2.x,http://10.0.2.x:80,http://otro-servidor.com`
  - Para permitir todos (NO RECOMENDADO): `*`

- `NODE_ENV`: Entorno de ejecución
  - `development`: Para desarrollo local
  - `production`: Para servidor de producción

### 3. Configuración de Seguridad (Recomendado para Producción)

Editar `docker-compose.yml` y cambiar las contraseñas por defecto:

```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: TU_PASSWORD_SEGURO_AQUI
  
  backend:
    environment:
      DB_PASSWORD: TU_PASSWORD_SEGURO_AQUI
```

## Despliegue

### 1. Construir las Imágenes
```bash
sudo docker compose build
```

### 2. Iniciar los Servicios
```bash
# Iniciar en modo detached (segundo plano)
sudo docker compose up -d

# O iniciar en modo interactivo para ver logs
sudo docker compose up
```

### 3. Verificar que los Contenedores Están Corriendo
```bash
sudo docker compose ps
```

Deberías ver algo como:
```
NAME                    STATUS              PORTS
sys-inventory-db-1      Up 2 minutes        0.0.0.0:5432->5432/tcp
sys-inventory-backend-1 Up 2 minutes        0.0.0.0:3000->3000/tcp
sys-inventory-frontend-1 Up 2 minutes       0.0.0.0:5173->80/tcp
sys-inventory-nginx-1   Up 2 minutes        0.0.0.0:80->80/tcp
```

## Verificación

### 1. Verificar el Backend
```bash
# Desde el servidor
curl http://localhost/api/

# Desde otra máquina en la red
curl http://10.0.2.x/api/
```

Deberías recibir: `Inventory API is running`

### 2. Verificar el Frontend
Abrir en un navegador:
- Desde el servidor: `http://localhost`
- Desde otra máquina: `http://10.0.2.x`

### 3. Ver Logs
```bash
# Ver logs de todos los servicios
sudo docker compose logs

# Ver logs de un servicio específico
sudo docker compose logs backend
sudo docker compose logs frontend
sudo docker compose logs nginx
sudo docker compose logs db

# Seguir logs en tiempo real
sudo docker compose logs -f backend
```

### 4. Verificar CORS
```bash
# Verificar que CORS está configurado correctamente
curl -H "Origin: http://10.0.2.x" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://10.0.2.x/api/auth/login -v
```

Deberías ver headers como:
```
Access-Control-Allow-Origin: http://10.0.2.x
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

## Configuración de Red y Firewall

### Puertos Necesarios

El sistema utiliza los siguientes puertos:

| Puerto | Servicio | Descripción | Acceso |
|--------|----------|-------------|--------|
| 80 | NGINX | Gateway principal | Público |
| 3000 | Backend | API (interno) | Solo Docker |
| 5173 | Frontend | App web (interno) | Solo Docker |
| 5432 | PostgreSQL | Base de datos | Solo Docker |

### Configurar Firewall (Ubuntu/Debian)

```bash
# Permitir tráfico HTTP
sudo ufw allow 80/tcp

# Permitir tráfico HTTPS (si usas SSL)
sudo ufw allow 443/tcp

# Permitir SSH (si necesitas acceso remoto)
sudo ufw allow 22/tcp

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

### Configurar Firewall (Windows Server)

```powershell
# Abrir PowerShell como Administrador

# Permitir tráfico HTTP
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Permitir tráfico HTTPS
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### Acceso desde Otras Máquinas en la Red

Para que otras máquinas puedan acceder al sistema:

1. **Verificar que el servidor tiene una IP estática** en la red local
2. **Configurar el firewall** para permitir tráfico en el puerto 80
3. **Actualizar el archivo `.env`** con la IP correcta
4. **Reiniciar los servicios**:
   ```bash
   sudo docker compose down
   sudo docker compose up -d
   ```

## Comandos Útiles

### Gestión de Servicios
```bash
# Detener todos los servicios
sudo docker compose down

# Reiniciar un servicio específico
sudo docker compose restart backend

# Reconstruir y reiniciar un servicio
sudo docker compose up -d --build backend

# Ver estado de los servicios
sudo docker compose ps

# Ver uso de recursos
sudo docker stats
```

### Gestión de Datos
```bash
# Backup de la base de datos
sudo docker compose exec db pg_dump -U postgres inventory_db > backup.sql

# Restaurar base de datos
sudo docker compose exec -T db psql -U postgres inventory_db < backup.sql

# Limpiar volúmenes (CUIDADO: elimina todos los datos)
sudo docker compose down -v
```

### Actualización del Sistema
```bash
# Detener servicios
sudo docker compose down

# Actualizar código (si usas Git)
git pull

# Reconstruir imágenes
sudo docker compose build

# Iniciar servicios
sudo docker compose up -d
```

## Troubleshooting

### Problema: "Cannot connect to the Docker daemon"
**Solución:**
```bash
# Verificar que Docker está corriendo
sudo systemctl status docker

# Iniciar Docker si está detenido
sudo systemctl start docker

# Habilitar Docker al inicio
sudo systemctl enable docker
```

### Problema: "Port already in use"
**Solución:**
```bash
# Ver qué proceso está usando el puerto 80
sudo lsof -i :80
# O en Windows
netstat -ano | findstr :80

# Detener el proceso o cambiar el puerto en docker-compose.yml
```

### Problema: "CORS error" desde el navegador
**Solución:**
1. Verificar que `SERVER_IP` en `.env` coincide con la IP desde donde accedes
2. Verificar logs del backend:
   ```bash
   sudo docker compose logs backend | grep CORS
   ```
3. Si necesitas permitir múltiples orígenes, configurar `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=http://10.0.2.3,http://10.0.2.14,http://localhost
   ```

### Problema: Backend no puede conectar a la base de datos
**Solución:**
```bash
# Verificar que la base de datos está corriendo
sudo docker compose ps db

# Ver logs de la base de datos
sudo docker compose logs db

# Reiniciar la base de datos
sudo docker compose restart db

# Verificar conectividad desde el backend
sudo docker compose exec backend ping db
```

### Problema: "Cannot find module" en el backend
**Solución:**
```bash
# Reconstruir el backend
sudo docker compose build backend

# Si persiste, limpiar y reconstruir
sudo docker compose down
sudo docker compose build --no-cache backend
sudo docker compose up -d
```

### Problema: Frontend muestra página en blanco
**Solución:**
```bash
# Ver logs del frontend
sudo docker compose logs frontend

# Ver logs de NGINX
sudo docker compose logs nginx

# Verificar que el frontend se construyó correctamente
sudo docker compose exec frontend ls -la /usr/share/nginx/html
```

## Credenciales por Defecto

El sistema crea un usuario administrador por defecto:

- **Usuario**: `admin`
- **Contraseña**: `Adm1n$ecur3!2025`

**⚠️ IMPORTANTE**: Cambiar esta contraseña inmediatamente después del primer login en producción.

## Soporte

Para problemas o preguntas:
1. Revisar los logs: `sudo docker compose logs`
2. Verificar la configuración de red y firewall
3. Consultar la documentación de Docker: https://docs.docker.com/

## Notas Adicionales

- El sistema está configurado para reiniciarse automáticamente (`restart: always`)
- Los datos de la base de datos persisten en un volumen Docker (`db_data`)
- Para backups regulares, configurar un cron job que ejecute el comando de backup de la base de datos
