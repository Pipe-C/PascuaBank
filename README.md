# 🏦 PascuaBank - Sistema Bancario Digital

Prototipo de aplicación bancaria (monorepo) desarrollado como proyecto académico para la Institución Universitaria Pascual Bravo. Simula las operaciones básicas de una cuenta de ahorros (depósitos y retiros) bajo una arquitectura en capas, con validaciones estrictas de negocio y trazabilidad de transacciones.

---

## 📑 Tabla de Contenidos

- [Integrantes y Roles](#-integrantes-y-distribución-de-roles-50--50)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
- [Documentación de la API](#-documentación-de-la-api)
- [Testing](#-testing)
- [Flujo de Trabajo (Git)](#-flujo-de-trabajo-git)

---

## 👥 Integrantes y Distribución de Roles (50% / 50%)

| Integrante | Rol | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Integrante 1** | Backend & Data Architect | API REST en NestJS, esquema Prisma ORM, reglas de negocio, DTOs y documentación Swagger. |
| **Integrante 2** | Frontend & Product Lead | UI/UX en React + Vite, integración Axios, validaciones en cliente, documentación y presentación. |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios |
| **Backend** | NestJS, TypeScript, class-validator / class-transformer |
| **Persistencia** | PostgreSQL (producción) / SQLite (desarrollo), Prisma ORM |
| **Documentación / Pruebas de API** | Swagger (OpenAPI), Postman Collection |
| **Flujo de Trabajo** | Git Flow (`main`, `dev`, `feature/*`), Conventional Commits |

---

## 🏗️ Arquitectura

El backend sigue una **Arquitectura en Capas** con separación estricta de responsabilidades:

```
Controllers → DTOs (validación) → Services (reglas de negocio) → Repositories/Prisma (persistencia)
```

**Decisiones clave de diseño:**

- **Montos en enteros (centavos):** evita errores de precisión de coma flotante (`0.1 + 0.2`) usando `Decimal` de Prisma o manejo en centavos.
- **Operaciones atómicas:** los retiros validan `balance - amount >= 0` a nivel de base de datos para prevenir condiciones de carrera en operaciones concurrentes.
- **Trazabilidad:** cada depósito/retiro se registra como una entrada inmutable en un historial de transacciones, no solo como una actualización de saldo.
- **Validación en capas:** `ValidationPipe` global sanea y valida cada payload antes de que llegue a la lógica de negocio.

---

## 📂 Estructura del Proyecto

```
PascuaBank/
├── client/                  # Frontend - React + Vite + TypeScript
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                  # Backend - NestJS + Prisma
│   ├── prisma/               # Esquema y migraciones de base de datos
│   ├── src/                  # Controllers, Services, DTOs
│   ├── test/                 # Pruebas unitarias / e2e
│   ├── nest-cli.json
│   └── prisma.config.ts
│
├── docker-compose.yml         # PostgreSQL local para desarrollo (credenciales dummy, no usar en producción)
└── README.md
```



---

## ✅ Requisitos Previos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Docker** y **Docker Compose** (recomendado, para levantar PostgreSQL sin instalación nativa) — alternativamente, PostgreSQL instalado localmente o SQLite para desarrollo rápido

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Pipe-C/PascuaBank.git
cd PascuaBank
```

### 2. Levantar el Backend (Server)

#### 2.1 Base de datos (PostgreSQL vía Docker — recomendado)

En lugar de instalar PostgreSQL de forma nativa, se puede levantar un contenedor con credenciales de desarrollo predefinidas. Desde la raíz del repositorio:

```bash
docker compose up -d
```

Esto expone Postgres en `localhost:5432` con las credenciales de `docker-compose.yml` (usuario `pascuabank`, base de datos `pascuabank`). Son credenciales **exclusivas de desarrollo local**, no usar en ningún entorno real.

Para detener el contenedor sin perder los datos: `docker compose stop`. Para eliminarlo junto con el volumen de datos: `docker compose down -v`.

> Si prefieres no usar Docker, puedes instalar PostgreSQL nativamente y ajustar `DATABASE_URL` según tu instalación.

#### 2.2 Instalar dependencias y configurar variables de entorno

```bash
cd server
npm install
```

Crea un archivo `.env` en `server/`:

```env
# Si usas el docker-compose.yml de la raíz, esta URL ya coincide con esas credenciales:
DATABASE_URL="postgresql://pascuabank:pascuabank_dev_only@localhost:5432/pascuabank"

# Alternativa sin Docker (SQLite, sin instalación adicional):
# DATABASE_URL="file:./dev.db"
```

#### 2.3 Migraciones y arranque

```bash
npx prisma migrate dev
npm run start:dev
```

Servidor disponible en: `http://localhost:3000`
Swagger: `http://localhost:3000/api/docs`

### 3. Levantar el Frontend (Client)

En una nueva terminal:

```bash
cd client
npm install
```

Configurar variables de entorno (opcional para desarrollo desacoplado con mocks, o para integración real con el backend):

```bash
# Copiar plantilla de variables de entorno
cp .env.example .env

# Ajustar en .env según el modo deseado:
# VITE_USE_MOCK=false  -> Modo integración real con NestJS (http://localhost:3000)
# VITE_USE_MOCK=true   -> Modo desacoplado con datos simulados en memoria
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Cliente disponible en: `http://localhost:5173`

---

## 📖 Documentación de la API

- **Swagger UI:** `http://localhost:3000/api/docs` — interfaz interactiva para probar endpoints en tiempo real.
- **Postman Collection:** archivo JSON con requests preconfigurados (Deposit, Withdraw, Get Balance) y variables de entorno para pruebas automatizadas. Ubicación: `server/postman/`.

---

## 🧪 Testing

```bash
cd server
npm run test        # Pruebas unitarias
npm run test:e2e    # Pruebas end-to-end
npm run test:cov    # Cobertura
```

---

## 🔀 Flujo de Trabajo (Git)

- **`main`:** rama estable, solo recibe merges desde `dev`.
- **`dev`:** rama de integración de features.
- **`feature/*`:** una rama por funcionalidad (ej. `feature/withdraw-endpoint`).
- **Commits:** siguen la convención [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.).
- **CI:** GitHub Actions ejecuta linter, validación de tipos (`tsc`) y tests automatizados en cada push o Pull Request.

---

## 📄 Licencia

Proyecto académico desarrollado para fines educativos — Institución Universitaria Pascual Bravo.