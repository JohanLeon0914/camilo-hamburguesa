# Camilo Hamburguesas

Aplicación web para menú digital, carrito persistente, checkout, historial de pedidos, fidelidad y panel administrativo en tiempo real.

## Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS y Realtime
- Zustand con `localStorage` para carrito persistente
- Zod para validaciones

## Instalación

```bash
npm install
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Obtén estas claves en Supabase desde `Project Settings > API`:

- `NEXT_PUBLIC_SUPABASE_URL`: el campo `Project URL`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: la clave pública `Publishable key`.
- `SUPABASE_SECRET_KEY`: la clave nueva `Secret key` (`sb_secret_...`), solo para el servidor.

`SUPABASE_SECRET_KEY` nunca debe usarse en componentes cliente, ni llevar el prefijo `NEXT_PUBLIC_`, ni subirse al repositorio. La app también acepta `SUPABASE_SERVICE_ROLE_KEY` como respaldo si tu proyecto todavía solo muestra las claves legacy.

## Supabase

1. Crea el proyecto `camilo-hamburguesas`.
2. Ejecuta `supabase/migrations/202608180001_initial_schema.sql`.
3. Ejecuta `supabase/seed.sql` para productos iniciales.
4. Habilita Google OAuth en Supabase Auth.
5. Agrega redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://TU_DOMINIO/auth/callback`

La migración crea tablas, índices, constraints, RLS, trigger de perfiles, límite de 3 direcciones, administrador inicial `johanleon991@gmail.com`, ledger de fidelidad y RPC `create_order_secure`.

## Flujo

### Mercado Pago / PSE

Ejecuta `supabase/migrations/202608210001_mercadopago_payments.sql`. Agrega `MERCADOPAGO_ACCESS_TOKEN` al entorno del servidor y registra `https://TU_DOMINIO/api/webhooks/mercadopago` como notificación de pagos en Mercado Pago. Checkout Pro permite ofrecer PSE en Colombia; el cliente será redirigido a Mercado Pago y el webhook verificará el pago consultando su API antes de mostrar la orden al administrador.

El cliente puede navegar el menú sin sesión, agregar productos al carrito y conservarlos aunque salga de la página. Para confirmar pedido debe iniciar sesión con Google. El servidor envía únicamente `productId`, cantidad y dirección; Supabase calcula precios, subtotal, descuento y total.

El admin entra en `/admin`, recibe pedidos por Supabase Realtime, abre el detalle y marca como entregado. El historial está en `/admin/history` con filtros y paginación.

## Verificación

```bash
npm run lint
npm run build
npm run test
```
