# 🏦 PascuaBank Client — Documentación Técnica del Frontend

Módulo de interfaz de usuario, consumo de servicios REST y gestión de estado del sistema bancario digital **PascuaBank**, desarrollado para la **Institución Universitaria Pascual Bravo**.

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Frontend y Principios de Diseño](#1-arquitectura-del-frontend-y-principios-de-diseño)
2. [Custom Hooks de Dominio](#2-custom-hooks-de-dominio)
3. [Patrón de Mutación Optimista con Rollback (Snapshot)](#3-patrón-de-mutación-optimista-con-rollback-snapshot)
4. [Dirección de Arte "Banca Esmeralda" y Sistema de Temas](#4-dirección-de-arte-banca-esmeralda-y-sistema-de-temas)
5. [Resiliencia y Manejo Global de Errores](#5-resiliencia-y-manejo-global-de-errores)
6. [Modos de Operación: Mock vs Integración Real](#6-modos-de-operación-mock-vs-integración-real)
7. [Estructura Modular de Carpetas](#7-estructura-modular-de-carpetas)
8. [Comandos y Suite de Pruebas](#8-comandos-y-suite-de-pruebas)

---

## 1. Arquitectura del Frontend y Principios de Diseño

El frontend está estructurado bajo una **Arquitectura en 3 Capas Desacopladas**, garantizando alta cohesión y bajo acoplamiento:

```
┌────────────────────────────────────────────────────────┐
│             Capa 1: Presentación (UI)                  │
│   (Header, BalanceCard, TransactionForm, Table, etc.)  │
└───────────────────────────┬────────────────────────────┘
                            │ Consume estado y eventos
┌───────────────────────────▼────────────────────────────┐
│          Capa 2: Lógica de Dominio (Hooks)             │
│            (useAccount, useTransactionForm)            │
└───────────────────────────┬────────────────────────────┘
                            │ Ejecuta llamadas HTTP
┌───────────────────────────▼────────────────────────────┐
│         Capa 3: Acceso a Datos y Servicios             │
│            (services/api.ts + Axios Client)            │
└────────────────────────────────────────────────────────┘
```

### Principios Fundamentales
- **Single Responsibility Principle (SRP):** Los componentes de presentación únicamente renderizan JSX y reciben handlers vía props. No realizan peticiones de red ni implementan reglas de negocio inline.
- **Prevención de Componentes "God":** Cada componente tiene una responsabilidad acotada (< 150 líneas). Bloques complejos con su propia presentación se extraen como subcomponentes reutilizables.
- **Tipado Estricto Centralizado:** Todas las entidades (`Account`, `Transaction`, `ApiError`, `TransactionType`) se definen exclusivamente en `src/types/bank.types.ts`, eliminando duplicaciones de contratos en componentes.
- **Capa Única de Transporte:** Ningún componente o hook interactúa con `axios` directamente; todo el tráfico pasa por `services/api.ts`.

---

## 2. Custom Hooks de Dominio

Toda la lógica de estado y reglas de negocio bancarias está encapsulada en custom hooks:

### `useTransactionForm`
- **Responsabilidad:** Gestiona la máquina de estados de los formularios de depósito y retiro.
- **Reglas de Negocio en Cliente:**
  - Monto estrictamente mayor a cero (`> 0`).
  - En retiros, valida en tiempo real que el monto no exceda el saldo disponible (`amount <= currentBalance`).
  - Sanitización estricta por regex: bloquea caracteres no numéricos y formatea miles en vivo con `Intl.NumberFormat('es-CO')`.
  - Ciclo de vida `isTouched` / `error`: el error solo se revela al desenfocar (`onBlur`) para no interrumpir la digitación inicial, y se limpia dinámicamente (`onChange`) tan pronto como el valor vuelve a ser válido.
  - Submit asíncrono puro: maneja `isLoading` dependiendo exclusivamente de la promesa retornada por `onSubmit`, sin temporizadores simulados internos.

### `useAccount`
- **Responsabilidad:** Orquesta la carga de la cuenta bancaria (`GET /accounts/:id`), el estado global de balance, las listas de movimientos y la sincronización con el backend.
- Expone los métodos `deposit(amount)` y `withdraw(amount)` integrados con el patrón de actualización optimista.

---

## 3. Patrón de Mutación Optimista con Rollback (Snapshot)

Para brindar una experiencia de usuario inmediata (cero latencia percibida en la interfaz), las transacciones aplican **mutaciones optimistas**:

```ts
// 1. Snapshot inmutable del estado actual previo a la mutación
const snapshot = { ...currentAccount, transactions: [...currentAccount.transactions] };

// 2. Actualización instantánea en la UI
setAccount({
  ...currentAccount,
  balance: optimisticBalance,
  transactions: [optimisticTxn, ...currentAccount.transactions],
});

try {
  // 3. Petición HTTP al servidor
  const updatedAccount = await api.deposit(accountId, amount);
  // 4. Sincronización definitiva con los datos del backend
  setAccount(updatedAccount);
} catch (err) {
  // 5. ROLLBACK ATÓMICO: Restaura el snapshot previo ante cualquier error
  setAccount(snapshot);
  throw err; // Propaga el ApiError normalizado para la alerta visual
}
```

**Beneficios:** Si la red se interrumpe o el backend rechaza la transacción (ej. código `400` o `422`), el saldo y el historial regresan automáticamente a su estado original exacto sin inconsistencias.

---

## 4. Dirección de Arte "Banca Esmeralda" y Sistema de Temas

El diseño visual evita patrones genéricos y adopta una identidad sobria inspirada en la banca institucional:

### Paleta de Color y Tokens Semánticos
- **Modo Oscuro:** Fondo verde-negro profundo (`#030c07`), tarjetas con tintes esmeralda y acentos en dorado ámbar (`#fbbf24`).
- **Modo Claro ("Banca Esmeralda Clara"):** Fondo marfil cálido (`#faf8f3`), tarjetas en crema uniforme (`#f2ede4` sin blancos clínicos `#ffffff`), texto en verde bosque profundo (`#12261a`) y acentos en ámbar institucional (`#d97706`).
- **Integración Tailwind CSS v4:** Sincronizado vía `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`, respondiendo de forma reactiva al atributo `data-theme` en `<html>`.
- **Accesibilidad WCAG AA:** Ratios de contraste calculados que superan el estándar mínimo de `4.5:1` (alcanzando `5.0:1` a `13.6:1` en elementos clave de ambos modos).
- **Tipografía Financiera:** Google Fonts `JetBrains Mono` (`font-financial`) reservada exclusivamente para montos y números de cuenta; `Inter` para la interfaz general.

---

## 5. Resiliencia y Manejo Global de Errores

La aplicación implementa una estrategia de resiliencia en múltiples niveles:

1. **`GlobalErrorBoundary`:** Envuelve la raíz de la aplicación. Si ocurre una excepción síncrona fatal de renderizado, previene la pantalla en blanco y ofrece una vista de recuperación con límite de 2 reintentos consecutivos antes de sugerir la recarga del portal.
2. **`SectionErrorBoundary`:** Aísla de forma independiente las secciones de operaciones e historial. Si una tabla o formulario falla, el encabezado y la tarjeta de saldo permanecen intactos y funcionales.
3. **Normalización de Errores de API (`normalizeApiError`):** Intercepta respuestas de Axios y convierte errores `400`, `422`, `404` y caídas de red (`ERR_NETWORK`) al formato unificado `ApiError` con mensajes en español claro.
4. **`NotificationToast`:** Sistema de alertas flotantes accesible (`aria-live="assertive"`) con variantes de éxito (`200 OK`) y error.

---

## 6. Modos de Operación: Mock vs Integración Real

El comportamiento de red está controlado de forma explícita por variables de entorno en `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true
```

| Configuración | Comportamiento |
|---|---|
| `VITE_USE_MOCK=true` | **Modo de desarrollo desacoplado:** Las llamadas a `api.ts` operan contra un almacén mutable en memoria (`mockStore`) con latencia simulada. Permite el avance continuo del frontend sin depender del backend. |
| `VITE_USE_MOCK=false` | **Modo de integración real:** Realiza peticiones HTTP directas con Axios a `http://localhost:3000`. Ante un fallo de red o del servidor, **nunca** recurre a mocks silenciosos, ejecutando el rollback estricto. |

---

## 7. Estructura Modular de Carpetas

```
client/src/
├── components/
│   ├── BalanceCard/          # Tarjeta prominente de saldo con conteo animado (rAF)
│   ├── ErrorBoundary/        # GlobalErrorBoundary y SectionErrorBoundary
│   ├── Header/               # Encabezado, identidad del banco y selector de tema
│   ├── Notification/         # Alertas flotantes (NotificationToast)
│   ├── TransactionForm/      # Formulario reutilizable parametrizado (Deposit / Withdraw)
│   ├── TransactionHistory/   # Tabla responsiva de movimientos con stagger (Framer Motion)
│   └── TransactionPanel/     # Layout orquestador en grid de los formularios
├── context/
│   └── ThemeContext.tsx      # Provider de tema claro/oscuro persistido en localStorage
├── data/
│   └── mock.data.ts          # Datos estáticos iniciales de desarrollo
├── hooks/
│   ├── useAccount.ts         # Hook de dominio de cuenta, API y rollback
│   └── useTransactionForm.ts # Hook de validaciones de formulario y sanitización
├── services/
│   └── api.ts                # Cliente Axios, endpoints REST y normalizador de errores
├── test/
│   └── setup.ts              # Configuración global de matchers jest-dom en Vitest
├── types/
│   └── bank.types.ts         # Interfaces y contratos TypeScript centralizados
├── utils/
│   └── formatCurrency.ts     # Formateador monetario centralizado en COP
├── App.tsx                   # Shell principal del dashboard y composición
├── index.css                 # Directivas Tailwind v4, tokens de tema CSS y mesh gradients
└── main.tsx                  # Punto de entrada de la aplicación React
```

---

## 8. Comandos y Suite de Pruebas

### Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Vite) en http://localhost:5173
npm run dev

# Ejecutar suite de pruebas unitarias automatizadas (Vitest)
npm test

# Ejecutar pruebas en modo observador interactivo
npm run test:watch

# Validar tipado TypeScript estricto y generar bundle de producción
npm run build
```

### Cobertura de la Suite de Pruebas
La suite de pruebas automatizadas con Vitest y React Testing Library cubre:
- **Formateo Monetario:** Validación de cifras estándar en COP, ceros, montos negativos (`-$`) y números de gran volumen.
- **Validaciones en Cliente:** Bloqueo de caracteres no numéricos, validación de montos vacíos (`onBlur`), montos `<= 0`, retiros mayores al saldo disponible y ciclo de vida de submit con estados de carga.
- **Lógica de Dominio y Rollback:** Carga inicial de cuenta, mutaciones optimistas de saldo, rollback a snapshot previo ante rechazo de la API y propagación de `ApiError`.
- **Capa de Servicios:** Normalización de errores HTTP (`400`, `422`, `404`, `ERR_NETWORK`) y blindaje de modo real (`VITE_USE_MOCK=false`).
