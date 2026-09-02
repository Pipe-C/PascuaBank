<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🚀 PascuaBank - Backend API

API RESTful bancaria construida con **NestJS**, **TypeScript**, **Prisma ORM** y **PostgreSQL**. Ofrece una arquitectura modular, lógica para transacciones financieras con precisión decimal, validación estricta de DTOs y pruebas E2E automatizadas.

---

## 🛠️ Arquitectura y Tecnologías Backend

* **Framework:** NestJS (Node.js + TypeScript).
* **ORM:** Prisma ORM con PostgreSQL.
* **Validación:** `class-validator` y `class-transformer` configurados con un `ValidationPipe` global.
* **Pruebas:** Jest + Supertest para suite de pruebas E2E e integración.
* **Configuración:** `@nestjs/config` e integración de variables de entorno mediante `dotenv`.

---

## ⚡ Endpoints de la API (`AccountsModule`)

| Método | Ruta | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/accounts/:id` | Obtiene el estado de la cuenta y su historial de transacciones. | `200 OK`, `404 Not Found` |
| **POST** | `/accounts/:id/deposit` | Realiza un depósito y actualiza el saldo de la cuenta. | `200 OK`, `400 Bad Request` |
| **POST** | `/accounts/:id/withdraw` | Realiza un retiro de fondos validando fondos suficientes. | `200 OK`, `400 Bad Request`, `422 Unprocessable Entity` |

---

## 🗄️ Modelo de Datos (Prisma Schema)

* **Account:** Almacena el número de cuenta (`accountNumber`), titular (`holderName`), saldo (`balance`), tipo de cuenta (`type`) y relación con transacciones.
* **Transaction:** Registra cada movimiento realizado (`type`: `DEPOSIT` | `WITHDRAWAL`), monto (`amount`), saldo resultante (`balanceAfter`), timestamp (`date`) y descripción.

---

## 🧪 Pruebas E2E y Calidad de Código

* **Limpieza de estado:** Fixtures automatizados en `beforeAll` y `afterAll` para garantizar un estado limpio en la base de datos de pruebas.
* **Casos probados:**
  * Consulta exitosa de cuenta y manejo de error `404`.
  * Depósitos con incremento de saldo y rechazo de montos negativos (`400`).
  * Retiros exitosos y validaciones de saldo insuficiente (`422`).
* **Cierre limpio de conexiones:** Gestión explícita de desinfección de clientes de Prisma y NestJS para evitar *open handles*.

---

## 🚀 Comandos de Ejecución

**Generar prisma:**

```bash
npx prisma generate
```

**Servidor en desarrollo:**
```bash
npm run start:dev
```

**Realizar pruebas End to End (e2e):**

```bash
npm run test:e2e
```



