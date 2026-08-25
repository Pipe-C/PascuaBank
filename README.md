# 🏦 PascuaBank - Sistema Bancario Digital

Prototipo de aplicación bancaria (monorepo) desarrollado como proyecto académico para la Institución Universitaria Pascual Bravo. Simula las operaciones básicas de una cuenta de ahorros (depósitos y retiros) bajo una arquitectura en capas, con validaciones estrictas de negocio y trazabilidad de transacciones.

---

## 📑 Tabla de Contenidos

- [Integrantes y Roles](#-integrantes-y-distribución-de-roles-50--50)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Mockups y Esquemas del Sistema](#-mockups-y-esquemas-del-sistema)
- [Matriz de Cumplimiento de Requisitos](#-matriz-de-cumplimiento-de-requisitos)
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
| **Andrés Goez** | Backend & Data Architect | API REST en NestJS, esquema Prisma ORM, reglas de negocio, DTOs y documentación Swagger. |
| **Felipe Cano** | Frontend & Product Lead | UI/UX en React + Vite, integración Axios, validaciones en cliente, documentación y presentación. |

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

## 🎨 Mockups y Esquemas del Sistema

### 1. Mockup de Base de Datos (Modelo ERD / Relacional)

El backend utiliza **Prisma ORM** mapeando las entidades `Account` (Cuenta de Ahorros) y `Transaction` (Historial de Transacciones) sobre **PostgreSQL 16**:

```mermaid
erDiagram
    Account {
        String id PK "UUID autogenerado"
        String accountNumber UK "Número de cuenta único (ej. 1042-8859-33)"
        String accountHolder "Nombre del titular (ej. Felipe Cano)"
        Int balance "Saldo disponible en centavos (evita coma flotante)"
        DateTime createdAt "Fecha de apertura"
        DateTime updatedAt "Última actualización de saldo"
    }

    Transaction {
        String id PK "UUID autogenerado"
        String accountId FK "Clave foránea hacia Account"
        String type "DEPOSIT | WITHDRAWAL"
        Int amount "Monto procesado en centavos (> 0)"
        Int balanceAfter "Saldo resultante tras la transacción"
        String status "SUCCESS | FAILED"
        DateTime createdAt "Fecha y hora exacta de la operación"
    }

    Account ||--o{ Transaction : "1 cuenta posee N transacciones"
```

---

### 2. Mockup Visual de Interfaz (UI Dashboard Layout)

La interfaz del cliente frontend (`/client`) está estructurada en un Dashboard modular reactivo con temas **Banca Esmeralda (Modo Oscuro / Modo Claro)**:

```mermaid
graph TD
    subgraph UI_Dashboard ["🎨 PascuaBank Frontend UI (React + Vite)"]
        direction TB
        Header["Encabezado: Logo + Identidad del Banco + Selector Tema (Sol/Luna) + Info Titular"]
        BalanceCard["💳 Tarjeta Prominente de Saldo: Conteo Animado rAF + Saldo en COP (JetBrains Mono)"]
        
        subgraph Operations ["Formularios de Operaciones Financieras"]
            DepositForm["🟢 Formulario de Depósito: Input con separador de miles en vivo + Botón Depositar"]
            WithdrawForm["🔴 Formulario de Retiro: Validación Saldo Insuficiente en vivo + Botón Retirar"]
        end
        
        Table["📊 Tabla Responsiva de Movimientos: Filtros, Stagger de filas y montos etiquetados"]
        Toast["🔔 NotificationToast: Alerta flotante verde (200 OK) / roja (400/422 Error)"]
    end

    Header --> BalanceCard
    BalanceCard --> Operations
    Operations --> Table
    Operations -. Evento Submit .-> Toast
```

**Representación Wireframe del Dashboard:**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏦 PascuaBank                        Cuenta: 1042-8859-33 (Felipe Cano)  [☀️/🌙 Tema] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 💳 Saldo Disponible                                                                │ │
│ │    $ 4.850.000 COP                                      [✓ Cuenta activa]           │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                        │
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│ │ 📥 Depositar Dinero                  │  │ 📤 Retirar Dinero                        │ │
│ │ Monto ($ COP): [ 500.000         ]   │  │ Monto ($ COP): [ 200.000           ]     │ │
│ │ ( Validado: > $0 )                   │  │ ( Validado: > $0 y <= $ 4.850.000 )      │ │
│ │ [ 🟢 Confirmar Depósito           ]  │  │ [ 🔴 Confirmar Retiro                 ]  │ │
│ └──────────────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Historial Reciente de Transacciones                                             │ │
│ │ Fecha        │ Tipo        │ Monto              │ Saldo Resultante   │ Estado      │ │
│ │ 2026-08-25   │ DEPOSIT     │ +$ 500.000 COP     │ $ 4.850.000 COP    │ 🟢 Exitoso  │ │
│ │ 2026-08-24   │ WITHDRAWAL  │ -$ 150.000 COP     │ $ 4.350.000 COP    │ 🟢 Exitoso  │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│ [🔔 Toast Notification: "Depósito realizado con éxito (+ $500.000 COP)"]             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Diagrama de Arquitectura y Flujo CI/CD (End-to-End)

Representación del flujo GitFlow, pipeline de integración continua (GitHub Actions), cliente React, servidor NestJS e infraestructura PostgreSQL en Docker:

```mermaid
flowchart TD
    subgraph GitFlow ["🔀 Flujo GitFlow y CI/CD (GitHub)"]
        FeatureBranch["Ramas feature/*\n(Desarrollo individual)"]
        PR["Pull Request"]
        DevBranch["Rama develop\n(Integración continua)"]
        CI["GitHub Actions (CI)\n(Linter, Pruebas Unitarias, Build)"]
        MergePR["Merge PR"]
        MainBranch["Rama main\n(Código estable listo para producción)"]

        FeatureBranch --> PR --> DevBranch --> CI --> MergePR --> MainBranch
    end

    subgraph Client ["💻 Cliente Frontend (React + Vite + TS)"]
        UIComp["Componentes UI\n(Header, BalanceCard, Forms, History)"]
        HooksState["Hooks y Estado\n(useAccount, useTransactionForm)"]
        GlobalCtx["Contexto Global\n(Tema Claro/Oscuro & Control de Errores)"]
        APIClient["Cliente API (Axios)\n(Modo Real HTTP vs Modo Mock Local)"]

        UIComp --> HooksState --> GlobalCtx --> APIClient
    end

    subgraph Server ["⚙️ Servidor Backend (NestJS + TS)"]
        Controllers["Controladores REST\n(GET /accounts, POST /deposit, POST /withdraw)"]
        DTOs["DTOs & Validación\n(class-validator / class-transformer)"]
        Services["Servicios de Negocio\n(Reglas de Depósito, Retiro y Saldo)"]

        Controllers --> DTOs --> Services
    end

    subgraph Infra ["🗄️ Base de Datos e Infraestructura"]
        Prisma["Prisma ORM\n(Mapeo Objeto-Relacional & Migraciones)"]
        Postgres["PostgreSQL 16 (Docker)\n(Tablas: Accounts & Transactions)"]

        Prisma --> Postgres
    end

    GitFlow -. Despliegue .-> Client
    APIClient == "HTTP / JSON" ==> Controllers
    Services == "Consultas ORM" ==> Prisma
```

---

## 📋 Matriz de Cumplimiento de Requisitos

| Requisito / Criterio de Evaluación | Estado | Evidencia Técnica en la Arquitectura |
| :--- | :---: | :--- |
| **1. Procesamiento de operaciones válidas** | ✅ Cumple | `useAccount` y `useTransactionForm` procesan depósitos y retiros actualizando saldo e historial vía API REST (`services/api.ts`). |
| **2. Reglas de negocio** | ✅ Cumple | Depósito > 0, retiro > 0, retiro <= saldo disponible y saldo nunca negativo (validado en UI y en el servicio NestJS). |
| **3. Resultado claro al usuario** | ✅ Cumple | `NotificationToast` accesible muestra alertas verdes en `200 OK` y rojas en error (`400`, `422`, `ERR_NETWORK`), con rollback optimista ante fallos. |
| **4. Validación estricta de datos** | ✅ Cumple | Sanitización regex `[^0-9]` en vivo, formato de miles `es-CO`, campos obligatorios y validación en eventos `onBlur` / `onChange`. |
| **5. Código 100% en Inglés** | ✅ Cumple | Nombres de componentes, funciones, tipos, variables y comentarios en el código escritos en Inglés. |
| **6. Convenciones de nombres** | ✅ Cumple | Estándar `PascalCase` (componentes/interfaces), `camelCase` (hooks/funciones), `UPPER_SNAKE_CASE` (constantes globales). |
| **7. Repositorio remoto** | ✅ Cumple | Repositorio GitHub [`Pipe-C/PascuaBank`](https://github.com/Pipe-C/PascuaBank) activo con estrategia GitFlow (`main`, `dev`, `feature/*`). |
| **8. Separación de responsabilidades** | ✅ Cumple | Arquitectura en 3 capas desacopladas (UI Components -> Domain Hooks -> API Services). |
| **• API REST con endpoints claros** | ✅ Cumple | `GET /accounts/:id`, `POST /accounts/:id/deposit`, `POST /accounts/:id/withdraw`. |
| **• Pruebas mediante Postman** | ✅ Cumple | Colección Postman preconfigurada en `server/postman/` con requests de depósito, retiro y consulta. |
| **• Conventional Commits** | ✅ Cumple | Historial de commits estandarizado con prefijos `feat:`, `fix:`, `docs:`, `ci:`, `style:`. |
| **• Resiliencia y Manejo de Errores** | ✅ Cumple | Captura global vía `GlobalErrorBoundary`, `SectionErrorBoundary` y normalización `normalizeApiError`. |
| **• Cobertura de Pruebas** | ✅ Cumple | Suite automatizada en Vitest (26/26 pruebas pasando) y build `tsc -b && vite build` sin errores. |

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