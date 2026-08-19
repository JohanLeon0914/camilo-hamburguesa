# AGENTS.md

## 1. Objetivo del proyecto

Construir una aplicación web moderna para una hamburguesería usando **Next.js**, **TypeScript**, **Tailwind CSS** y **Supabase**.

El proyecto de Supabase se llama:

```text
camilo-hamburguesas
```

La aplicación debe funcionar principalmente como un **menú digital interactivo**, permitiendo a los clientes:

- Ver las hamburguesas disponibles.
- Ver imagen, nombre, descripción y precio.
- Agregar productos al carrito.
- Comprar directamente un producto.
- Realizar pedidos.
- Guardar sus datos de entrega.
- Guardar hasta 3 direcciones.
- Consultar su historial de pedidos.
- Obtener recompensas por pedidos frecuentes.

Además debe existir un **panel administrativo** donde usuarios autorizados puedan ver y gestionar pedidos en tiempo real.

El diseño debe ser profesional, elegante, llamativo y muy fácil de usar, inspirado en los menús de hamburgueserías americanas modernas.

---

# 2. Stack obligatorio

Usar:

```text
Next.js
TypeScript
React
Tailwind CSS
Supabase
Supabase Auth
Supabase PostgreSQL
Supabase Realtime
```

Preferir:

```text
Next.js App Router
Server Components cuando tengan sentido
Client Components solo cuando sean necesarios
Server Actions o Route Handlers para operaciones sensibles
Lucide React para iconos
Zod para validaciones
```

Se pueden agregar librerías auxiliares cuando aporten valor real, pero evitar dependencias innecesarias.

---

# 3. Principios generales

La aplicación debe:

- Ser responsive.
- Funcionar correctamente en móvil, tablet y escritorio.
- Priorizar la experiencia móvil.
- Tener navegación rápida.
- Tener estados de loading.
- Tener estados vacíos.
- Tener manejo de errores.
- Tener feedback visual después de cada acción.
- Evitar recargas completas de página.
- Tener una UI consistente.
- Tener código modular y mantenible.
- Separar correctamente lógica de negocio, componentes y acceso a datos.
- No exponer secretos ni claves privadas al cliente.
- Usar políticas RLS en Supabase.
- Validar datos tanto en frontend como backend.

No construir una simple demo visual.

La aplicación debe quedar estructurada como un producto real que posteriormente pueda ponerse en producción.

---

# 4. Identidad visual

Crear una estética inspirada en una hamburguesería americana moderna.

La interfaz debe sentirse:

- Premium.
- Moderna.
- Cálida.
- Urbana.
- Gastronómica.
- Visualmente llamativa.
- Fácil de entender.

Usar una paleta basada principalmente en:

```text
Rojo
Negro
Amarillo / mostaza
Blanco / crema para contraste
```

Evitar que todos los componentes tengan colores fuertes simultáneamente.

Usar colores vivos como acentos.

Priorizar:

- Fotografías grandes de hamburguesas.
- Tipografía fuerte para títulos.
- Botones claros.
- Tarjetas elegantes.
- Bordes suaves.
- Sombras moderadas.
- Buen espacio entre elementos.
- Jerarquía visual clara.

El sitio no debe parecer una plantilla genérica de SaaS.

Tiene que sentirse como el sitio web real de una hamburguesería.

---

# 5. Página principal

La página principal debe presentar inmediatamente la hamburguesería y el menú.

Puede incluir un hero visual con:

- Nombre del negocio.
- Una hamburguesa destacada.
- Mensaje corto.
- CTA para ver el menú.

Ejemplo conceptual:

```text
Hamburguesas que hablan por sí solas.

Ver menú
```

No agregar grandes cantidades de texto.

El menú debe ser protagonista.

---

# 6. Menú de productos

Crear una sección de menú donde aparezcan todas las hamburguesas activas.

Cada producto debe mostrar:

```text
Imagen
Nombre
Descripción
Precio
Disponibilidad
Botón "Agregar al carrito"
Botón o acción "Ordenar ahora"
```

Ejemplo visual aproximado:

```text
┌─────────────────────────────┐
│         IMAGEN              │
│                             │
├─────────────────────────────┤
│ Bacon Burger                │
│                             │
│ Carne, queso cheddar,       │
│ bacon y salsa especial.     │
│                             │
│ $24.000                     │
│                             │
│ [Agregar] [Ordenar ahora]   │
└─────────────────────────────┘
```

Los productos deben provenir de Supabase.

No mantener el menú hardcodeado en componentes.

---

# 7. Modelo de productos

Crear una tabla similar a:

```sql
products
```

Campos sugeridos:

```text
id
name
slug
description
price
image_url
is_available
is_featured
created_at
updated_at
```

Tipos recomendados:

```text
id UUID
price INTEGER
```

Guardar precios como números enteros en pesos colombianos.

Por ejemplo:

```text
24000
```

No usar:

```text
24.000
```

como texto.

Formatear el valor únicamente en la interfaz.

---

# 8. Carrito

Implementar carrito de compras.

Cada item debe contener:

```text
product_id
name
price
image
quantity
```

El usuario debe poder:

- Agregar productos.
- Aumentar cantidad.
- Disminuir cantidad.
- Eliminar productos.
- Ver subtotal.
- Ir al checkout.

El carrito debe mantenerse si el usuario navega entre páginas.

Puede usarse estado global ligero y persistencia local.

Ejemplo:

```text
Zustand + localStorage
```

o una solución equivalente.

---

# 9. Comprar directamente

El botón:

```text
Ordenar ahora
```

debe permitir saltar directamente al proceso de checkout con ese producto.

No eliminar el carrito existente accidentalmente.

El flujo debe estar correctamente definido para diferenciar:

```text
Compra directa
```

de:

```text
Checkout del carrito
```

---

# 10. Login

Implementar autenticación con:

```text
Google OAuth
```

usando:

```text
Supabase Auth
```

No implementar un sistema de contraseñas propio.

El usuario debe poder:

```text
Iniciar sesión con Google
Cerrar sesión
```

Después de iniciar sesión, registrar o sincronizar su perfil en la base de datos.

---

# 11. Tabla de perfiles

Crear:

```sql
profiles
```

Campos sugeridos:

```text
id
email
full_name
phone
avatar_url
completed_orders_count
created_at
updated_at
```

El:

```text
id
```

debe corresponder con:

```text
auth.users.id
```

de Supabase.

El email debe provenir inicialmente de Google.

---

# 12. Información del cliente

Durante el checkout solicitar:

```text
Nombre
Celular
Dirección
```

Cuando el usuario guarde una dirección, almacenar junto con ella:

```text
Nombre del destinatario
Celular
Dirección
Información adicional
```

La información adicional puede incluir opcionalmente:

```text
Apartamento
Casa
Torre
Barrio
Referencia
Notas de entrega
```

Diseñar el esquema para poder ampliarlo posteriormente.

---

# 13. Direcciones

Cada usuario puede almacenar máximo:

```text
3 direcciones
```

Crear una tabla:

```sql
addresses
```

Campos sugeridos:

```text
id
user_id
label
recipient_name
phone
address
address_details
is_last_used
created_at
updated_at
```

Ejemplos de label:

```text
Casa
Trabajo
Otro
```

Antes de crear una cuarta dirección:

- Mostrar que ya existe el máximo permitido.
- Permitir editar una dirección.
- Permitir eliminar una dirección.

---

# 14. Dirección predeterminada

La dirección que el cliente haya utilizado en su pedido más reciente debe quedar seleccionada automáticamente la próxima vez.

No es obligatorio usar un campo:

```text
is_default
```

si puede deducirse de la última orden.

Sin embargo, puede mantenerse:

```text
last_used_at
```

para simplificar esta funcionalidad.

Al entrar al checkout:

1. Buscar las direcciones del cliente.
2. Ordenarlas por `last_used_at`.
3. Seleccionar automáticamente la más reciente.

El cliente debe poder cambiarla.

---

# 15. Checkout

Crear una página o vista clara para confirmar el pedido.

Debe mostrar:

```text
Productos
Cantidades
Precio individual
Subtotal
Descuento
Total
Dirección seleccionada
Nombre
Celular
```

El usuario debe poder elegir una dirección guardada o crear una nueva si todavía tiene espacio.

Ejemplo:

```text
Tu pedido

2x Bacon Burger        $48.000
1x Classic Burger      $20.000

Subtotal               $68.000

Descuento fidelidad     -$6.800

TOTAL                   $61.200
```

---

# 16. Pedidos

Crear una tabla:

```sql
orders
```

Campos sugeridos:

```text
id
user_id
customer_name
customer_email
customer_phone
delivery_address
delivery_details
status
subtotal
discount_percentage
discount_amount
total
loyalty_discount_applied
created_at
updated_at
delivered_at
```

Estados iniciales:

```text
pending
preparing
ready
delivered
cancelled
```

Aunque inicialmente solo sea obligatorio gestionar:

```text
pending
delivered
```

dejar el sistema preparado para usar los demás estados.

---

# 17. Items del pedido

Crear:

```sql
order_items
```

Campos:

```text
id
order_id
product_id
product_name
product_price
quantity
line_total
created_at
```

IMPORTANTE:

Guardar también:

```text
product_name
product_price
```

como snapshot.

No depender únicamente de la tabla `products`.

Si posteriormente cambia el precio de una hamburguesa, los pedidos anteriores deben seguir mostrando el precio pagado originalmente.

---

# 18. Sistema de fidelidad

Implementar la siguiente lógica:

```text
Cada 3 pedidos completados, el siguiente pedido obtiene 10% de descuento.
```

Ejemplo:

```text
Pedido 1 → sin descuento
Pedido 2 → sin descuento
Pedido 3 → sin descuento

Pedido 4 → 10% de descuento

Pedido 5 → sin descuento
Pedido 6 → sin descuento
Pedido 7 → sin descuento

Pedido 8 → 10% de descuento
```

El descuento depende únicamente de pedidos:

```text
delivered
```

No contar:

```text
pending
cancelled
```

El beneficio se genera al completar tres pedidos y se consume en la siguiente orden.

---

# 19. Seguridad del descuento

Nunca confiar en el frontend para calcular el descuento final.

El frontend puede mostrar una estimación.

Pero al crear el pedido:

```text
el backend debe consultar Supabase
verificar cuántas órdenes entregadas tiene el cliente
determinar si tiene disponible el descuento
calcular subtotal
calcular descuento
calcular total
crear la orden
```

No aceptar desde el cliente un `total` arbitrario.

---

# 20. Evitar doble utilización del descuento

Implementar la lógica de forma segura para evitar que un usuario pueda crear dos pedidos simultáneamente y utilizar el mismo beneficio dos veces.

Preferiblemente manejarlo mediante:

- función SQL,
- RPC,
- transacción,
- o mecanismo seguro equivalente en Supabase.

No implementar únicamente:

```text
SELECT cantidad de órdenes
→ calcular descuento en React
→ INSERT order
```

porque puede producir race conditions.

---

# 21. Historial del cliente

Crear una sección:

```text
Mis pedidos
```

donde el cliente pueda consultar su historial.

Mostrar:

```text
Número / ID corto
Fecha
Productos
Total
Estado
Descuento utilizado
```

Permitir abrir cada pedido para ver su detalle completo.

---

# 22. Indicador de fidelidad

Mostrar visualmente al cliente su progreso.

Ejemplo:

```text
🍔 2 de 3 pedidos

Te falta 1 pedido para obtener 10% de descuento.
```

Cuando ya tenga el beneficio:

```text
🎉 Tienes 10% de descuento disponible en tu próximo pedido.
```

Debe sentirse como una recompensa.

---

# 23. Panel administrativo

Crear:

```text
/admin
```

Esta sección debe estar protegida.

Inicialmente solo puede entrar:

```text
johanleon991@gmail.com
```

No basta con ocultar el enlace.

Debe existir validación real de permisos en el servidor y/o mediante políticas de Supabase.

---

# 24. Sistema de administradores

Aunque inicialmente exista un solo administrador, diseñar el sistema para poder añadir más en el futuro.

Preferiblemente crear tabla:

```sql
admins
```

Campos:

```text
id
user_id
email
created_at
```

Agregar inicialmente:

```text
johanleon991@gmail.com
```

No hardcodear toda la autorización exclusivamente en componentes React.

La autorización debe poder crecer posteriormente.

---

# 25. Dashboard de pedidos

El administrador debe ver inmediatamente las órdenes activas.

Mostrar tarjetas o filas con:

```text
Número de orden
Cliente
Hora
Cantidad de productos
Total
Estado
Indicador de descuento
```

Ejemplo:

```text
#A102

Johan León
7:32 PM

3 productos

$61.200

[10% descuento]

[Ver pedido]
[Marcar entregado]
```

---

# 26. Pedidos en tiempo real

Esta funcionalidad es obligatoria.

Usar:

```text
Supabase Realtime
```

El administrador NO debe tener que recargar la página para recibir nuevos pedidos.

Cuando llegue una orden nueva:

- agregarla automáticamente al dashboard,
- mostrar feedback visual,
- opcionalmente reproducir un sonido discreto,
- actualizar contadores.

Usar subscriptions correctamente.

Ejemplo conceptual:

```ts
supabase
  .channel("orders")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "orders",
    },
    handleNewOrder
  )
  .subscribe()
```

También reaccionar a cambios de estado cuando sea relevante.

Limpiar correctamente subscriptions al desmontar componentes.

---

# 27. Visualización detallada del pedido

Al seleccionar una orden abrir:

```text
Modal
Drawer
Sheet
```

Elegir la opción con mejor UX.

Mostrar:

```text
Cliente
Teléfono
Dirección
Detalles de entrega

Productos

2 x Bacon Burger
1 x Classic Burger

Subtotal

Descuento

Total

Fecha y hora

Estado
```

El administrador debe poder visualizar rápidamente todo lo necesario para preparar la orden.

---

# 28. Indicador de descuento en admin

Si el pedido tiene descuento, debe ser visualmente evidente.

Ejemplo:

```text
🏷 10% descuento fidelidad
```

Mostrar:

```text
Subtotal
Descuento
Total final
```

Ejemplo:

```text
Subtotal:   $70.000
Descuento:  -$7.000
Total:      $63.000
```

---

# 29. Marcar como entregado

El administrador debe poder:

```text
Marcar pedido como entregado
```

Al hacerlo:

```text
status = delivered
delivered_at = timestamp
```

La orden debe desaparecer de las órdenes activas y aparecer en el historial.

Esta acción debe actualizarse automáticamente en la interfaz.

---

# 30. Historial administrativo

Crear sección:

```text
Pedidos entregados
```

Mostrar una tabla paginada.

Columnas sugeridas:

```text
Orden
Fecha
Cliente
Productos
Subtotal
Descuento
Total
```

Agregar paginación.

No cargar miles de pedidos simultáneamente.

Implementar paginación desde Supabase.

---

# 31. Filtros administrativos

El historial debe poder filtrarse por:

```text
Fecha
Producto
```

Idealmente también:

```text
Cliente
```

aunque no sea obligatorio inicialmente.

Para fecha permitir:

```text
Desde
Hasta
```

Para producto permitir seleccionar una hamburguesa o escribir su nombre.

Los filtros deben ejecutarse en la base de datos siempre que sea posible.

---

# 32. Búsqueda por producto

Debido a que una orden puede tener múltiples productos, resolver correctamente la búsqueda mediante relación:

```text
orders
order_items
products
```

No intentar almacenar todos los productos como un string para facilitar búsquedas.

Mantener modelo relacional.

---

# 33. Supabase Storage

Las imágenes de productos deben poder almacenarse en:

```text
Supabase Storage
```

Crear bucket apropiado, por ejemplo:

```text
products
```

Las imágenes públicas del menú pueden servirse desde allí.

Guardar únicamente la URL o path correspondiente en:

```text
products.image_url
```

---

# 34. Row Level Security

Activar:

```text
RLS
```

en tablas que contengan información sensible.

Reglas mínimas:

### profiles

Un usuario únicamente puede consultar/modificar su propio perfil.

### addresses

Un usuario únicamente puede:

```text
SELECT
INSERT
UPDATE
DELETE
```

sus propias direcciones.

### orders

Un cliente únicamente puede consultar sus propias órdenes.

No debe poder modificar:

```text
total
discount
status
```

directamente.

### order_items

Un cliente puede consultar los items de sus propias órdenes.

### admin

Usuarios administradores pueden consultar las órdenes necesarias para operar el negocio.

Diseñar cuidadosamente las policies.

---

# 35. No confiar en permisos del frontend

Esto está prohibido como única medida:

```ts
if (user.email === "johanleon991@gmail.com") {
  return <AdminDashboard />
}
```

Esto puede utilizarse para UX, pero no como seguridad.

La autorización real debe existir en:

- servidor,
- Supabase,
- RLS,
- o combinación de estos.

---

# 36. Flujo completo de pedido

Implementar este flujo:

```text
Usuario visita sitio
        ↓
Ve menú
        ↓
Selecciona hamburguesas
        ↓
Agrega al carrito
        ↓
Checkout
        ↓
Si no tiene sesión:
Login Google
        ↓
Selecciona dirección
o crea una
        ↓
Confirma nombre y celular
        ↓
Backend calcula:
subtotal
descuento
total
        ↓
Se crea la orden
        ↓
Pantalla de confirmación
        ↓
Supabase Realtime
        ↓
Administrador recibe la orden automáticamente
```

---

# 37. Confirmación del pedido

Después de realizarlo mostrar una pantalla clara.

Ejemplo:

```text
¡Pedido recibido!

Orden #A105

Estamos preparando tu hamburguesa.

Total: $61.200
```

Agregar un CTA:

```text
Ver mi pedido
```

---

# 38. Navbar

Crear navegación simple.

Antes de iniciar sesión:

```text
Logo
Menú
Carrito
Iniciar sesión
```

Después de iniciar sesión:

```text
Logo
Menú
Mis pedidos
Carrito
Perfil
```

Si es administrador:

```text
Panel admin
```

---

# 39. Carrito visible

En móvil usar un indicador claro con número de items.

Ejemplo:

```text
🛒 3
```

Puede existir también una barra sticky en la parte inferior cuando hay items:

```text
Ver carrito • 3 productos • $62.000
```

Esto mejora la conversión en móvil.

---

# 40. Responsive

Diseñar primero para móvil.

Tamaños aproximados:

```text
Mobile
Tablet
Desktop
```

En móvil:

- botones grandes,
- imágenes claras,
- CTA fácilmente accesible,
- evitar tablas horizontales complejas.

El panel administrativo puede tener experiencia optimizada principalmente para tablet/escritorio, pero debe seguir siendo utilizable en móvil.

---

# 41. Estados de carga

No dejar pantallas vacías mientras carga Supabase.

Usar:

```text
Skeletons
Spinners discretos
Placeholder cards
```

según corresponda.

---

# 42. Estados vacíos

Ejemplos:

Carrito:

```text
Tu carrito está vacío 🍔

Explora nuestro menú y encuentra tu próxima hamburguesa.
```

Historial:

```text
Todavía no tienes pedidos.
```

Admin:

```text
No hay pedidos pendientes.
```

---

# 43. Errores

Mostrar errores comprensibles.

No mostrar directamente mensajes internos de PostgreSQL o Supabase al usuario.

Ejemplo incorrecto:

```text
duplicate key value violates unique constraint...
```

Ejemplo correcto:

```text
No pudimos crear tu pedido. Inténtalo nuevamente.
```

Registrar información técnica en logs cuando sea apropiado.

---

# 44. Formateo de precios

Crear helper reutilizable:

```ts
formatCOP()
```

Resultado:

```text
$24.000
```

Usar:

```text
es-CO
COP
```

Evitar implementar formato manual repetido.

---

# 45. Fechas

Mostrar las fechas usando formato colombiano.

Ejemplo:

```text
18 ago 2026
7:30 p. m.
```

Guardar timestamps en formato adecuado en PostgreSQL.

---

# 46. Validaciones

Validar:

### Nombre

No vacío.

### Celular

Formato válido.

### Dirección

No vacía.

### Cantidad

Mayor que 0.

### Producto

Debe existir y estar disponible.

### Precio

Siempre debe obtenerse desde la base de datos.

Nunca aceptar desde el navegador que:

```text
producto X cuesta $10
```

El backend debe consultar el precio verdadero.

---

# 47. Protección contra manipulación

Al crear una orden el cliente debe enviar únicamente algo equivalente a:

```json
{
  "items": [
    {
      "productId": "...",
      "quantity": 2
    }
  ],
  "addressId": "..."
}
```

El servidor debe resolver:

```text
nombre producto
precio
subtotal
descuento
total
```

desde la base de datos.

Nunca confiar en precios enviados por el navegador.

---

# 48. Componentes sugeridos

Organizar componentes aproximadamente así:

```text
components/
  layout/
    Navbar
    Footer

  menu/
    ProductCard
    ProductGrid
    FeaturedProduct

  cart/
    CartDrawer
    CartItem
    CartSummary

  checkout/
    AddressSelector
    AddressForm
    CheckoutSummary
    LoyaltyDiscount

  orders/
    OrderCard
    OrderDetails
    OrderStatus

  admin/
    ActiveOrderCard
    AdminOrderDetails
    OrdersTable
    OrdersFilters

  ui/
```

No crear componentes gigantes de cientos de líneas si pueden dividirse razonablemente.

---

# 49. Estructura sugerida de rutas

Con App Router:

```text
app/
  page.tsx

  menu/
    page.tsx

  cart/
    page.tsx

  checkout/
    page.tsx

  orders/
    page.tsx

  orders/[id]/
    page.tsx

  profile/
    page.tsx

  admin/
    page.tsx

  admin/history/
    page.tsx

  auth/
    callback/
      route.ts
```

Adaptar si existe una estructura mejor.

---

# 50. Capa de Supabase

Separar clientes Supabase.

Ejemplo:

```text
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
```

No crear un cliente nuevo de forma incorrecta en cada componente.

Seguir patrones actuales recomendados para Next.js + Supabase.

---

# 51. Variables de entorno

Usar:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

cuando sean necesarias.

Nunca exponer:

```text
SUPABASE_SERVICE_ROLE_KEY
```

al navegador.

Crear:

```text
.env.example
```

sin secretos reales.

---

# 52. Migraciones

Guardar el esquema de base de datos como migraciones SQL dentro del repositorio.

No limitarse a explicar:

```text
"Crea estas tablas manualmente en Supabase"
```

Crear archivos reproducibles.

Ejemplo:

```text
supabase/
  migrations/
```

Las migraciones deben contener:

- tablas,
- índices,
- constraints,
- triggers,
- funciones,
- policies,
- configuración necesaria para Realtime cuando aplique.

---

# 53. Índices

Agregar índices para consultas frecuentes.

Especialmente:

```text
orders.user_id
orders.status
orders.created_at
orders.delivered_at
order_items.order_id
order_items.product_id
addresses.user_id
```

Considerar índices compuestos cuando tengan sentido.

---

# 54. Integridad de datos

Agregar constraints adecuados.

Ejemplos:

```text
quantity > 0
price >= 0
subtotal >= 0
discount_amount >= 0
total >= 0
```

Usar foreign keys correctamente.

---

# 55. Límite de tres direcciones

No depender exclusivamente del frontend para el límite de:

```text
3 direcciones
```

También verificarlo del lado servidor o base de datos.

El usuario no debe poder evadirlo realizando requests manuales.

---

# 56. Datos iniciales

Crear seed o instrucciones simples para insertar productos de prueba.

Ejemplo:

```text
Classic Burger
Bacon Burger
Double Cheese
BBQ Burger
```

No utilizar imágenes aleatorias permanentes.

Dejar el sistema preparado para sustituirlas por fotografías reales.

---

# 57. Administración futura de productos

Aunque no sea obligatorio construir inmediatamente un CMS completo, diseñar `products` para que posteriormente el administrador pueda:

```text
Crear producto
Editar producto
Cambiar precio
Cambiar imagen
Marcar no disponible
```

No construir decisiones de arquitectura que dificulten esta función.

---

# 58. Estados en tiempo real

Para el dashboard administrativo:

Suscribirse al menos a:

```text
INSERT orders
UPDATE orders
```

Cuando llegue:

```text
INSERT
```

añadir la orden.

Cuando cambie:

```text
pending → delivered
```

retirarla de pedidos activos.

No volver a descargar toda la página si no es necesario.

---

# 59. Prevención de pedidos duplicados

Cuando el cliente pulse:

```text
Confirmar pedido
```

desactivar temporalmente el botón.

Mostrar estado:

```text
Creando pedido...
```

Evitar double submit.

Cuando sea apropiado usar:

```text
idempotency
```

o mecanismos equivalentes para evitar duplicaciones accidentales.

---

# 60. Accesibilidad

Mantener:

- contraste suficiente,
- labels en formularios,
- botones accesibles,
- navegación por teclado,
- `alt` adecuado en imágenes,
- focus states visibles,
- modales accesibles.

No sacrificar accesibilidad por estética.

---

# 61. SEO

Configurar metadata básica:

```text
title
description
OpenGraph
favicon
```

Ejemplo:

```text
Camilo Hamburguesas
```

No es necesario implementar SEO avanzado en la primera versión.

---

# 62. Rendimiento

Optimizar imágenes usando:

```text
next/image
```

Evitar:

- imágenes gigantes sin optimización,
- queries repetidas,
- renders innecesarios,
- cargar el historial completo en frontend,
- subscriptions duplicadas.

---

# 63. UX del administrador

El dashboard debe priorizar operación rápida.

La orden nueva debe poder entenderse en pocos segundos.

Priorizar:

```text
Hora
Cliente
Productos
Cantidad
Dirección
Total
```

Evitar adornos innecesarios en esta sección.

---

# 64. UX del cliente

El cliente debe poder realizar un pedido en pocos pasos.

Objetivo:

```text
Ver hamburguesa
↓
Agregar
↓
Checkout
↓
Dirección
↓
Confirmar
```

Evitar formularios largos y pasos innecesarios.

---

# 65. No implementar pagos online todavía

Por ahora NO integrar:

```text
Stripe
PayU
Mercado Pago
Wompi
PayPal
```

El sistema actual debe centrarse en crear y administrar pedidos.

Diseñar el código de forma que posteriormente sea posible agregar métodos de pago.

---

# 66. Código

Reglas:

```text
TypeScript strict
```

Evitar:

```ts
any
```

salvo casos excepcionales justificados.

Usar nombres claros.

Preferir:

```ts
calculateOrderTotal()
getLoyaltyStatus()
createOrder()
formatCOP()
```

sobre nombres ambiguos.

---

# 67. Manejo de lógica

La lógica crítica no debe vivir dentro de componentes visuales.

Por ejemplo:

```text
calcular descuento
validar admin
crear pedido
validar dirección
```

debe vivir en servicios, acciones, funciones SQL o módulos apropiados.

---

# 68. README

Crear un README explicando:

```text
Descripción
Stack
Arquitectura
Instalación
Variables de entorno
Configuración de Supabase
Google OAuth
Migraciones
Seed
Desarrollo local
Build
Deploy
```

Incluir instrucciones precisas.

---

# 69. Google OAuth

Documentar qué debe configurarse en Supabase para utilizar Google.

El callback de Next.js debe estar implementado.

Considerar correctamente:

```text
localhost
producción
```

para redirect URLs.

---

# 70. Middleware / protección de rutas

Proteger las rutas correspondientes.

Por ejemplo:

```text
/checkout
/orders
/profile
/admin
```

No todas requieren exactamente la misma política.

El menú público debe poder consultarse sin login.

El usuario puede navegar y agregar al carrito antes de iniciar sesión.

Solicitar login cuando sea necesario confirmar la compra.

---

# 71. Diseño del panel admin

Desktop aproximado:

```text
┌─────────────────────────────────────────────┐
│ Camilo Hamburguesas          Admin   Johan │
├──────────┬──────────────────────────────────┤
│ Pedidos  │ Pedidos activos                  │
│          │                                  │
│ Historial│ [Orden] [Orden] [Orden]          │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

Puede existir sidebar en escritorio y navegación adaptada en móvil.

---

# 72. Métricas simples

En admin mostrar métricas útiles del día:

```text
Pedidos pendientes
Pedidos entregados hoy
Ventas del día
```

No construir todavía un dashboard analítico complejo.

---

# 73. Notificación visual de nueva orden

Cuando Supabase Realtime detecte un pedido nuevo:

Mostrar algo como:

```text
Nueva orden recibida 🍔
```

Usar toast o banner discreto.

La nueva tarjeta puede resaltar brevemente.

No usar animaciones exageradas.

---

# 74. Confirmaciones administrativas

Antes de acciones destructivas o importantes, pedir confirmación cuando sea apropiado.

Por ejemplo:

```text
¿Marcar esta orden como entregada?
```

No pedir confirmación para cada interacción trivial.

---

# 75. Tipos generados de Supabase

Cuando sea posible generar y utilizar tipos TypeScript del esquema Supabase.

Evitar mantener manualmente múltiples interfaces que puedan quedar desactualizadas respecto a PostgreSQL.

---

# 76. Pruebas mínimas

Agregar pruebas para lógica crítica.

Como mínimo:

```text
cálculo de subtotal
cálculo del 10%
elegibilidad de fidelidad
formatCOP
validaciones
```

Si se implementan funciones SQL críticas, probar sus escenarios principales.

---

# 77. Casos del sistema de fidelidad

Probar explícitamente:

```text
0 entregados → sin descuento
1 entregado → sin descuento
2 entregados → sin descuento
3 entregados → próximo pedido con 10%
4 entregados → ciclo nuevo
5 entregados → ciclo nuevo
6 entregados → ciclo nuevo
7 entregados → próximo pedido correspondiente al siguiente ciclo
```

La implementación real debe manejar correctamente el beneficio utilizado y no solamente hacer:

```ts
completedOrders % 3 === 0
```

sin considerar si el descuento ya fue consumido.

Diseñar un sistema confiable para representar:

```text
progreso
beneficio ganado
beneficio consumido
```

Puede usarse un ledger de recompensas, contador controlado o mecanismo equivalente.

Elegir la solución que mantenga mayor integridad.

---

# 78. Estados históricos

Un pedido entregado nunca debe perder información histórica relevante si cambia posteriormente:

```text
nombre producto
precio
dirección utilizada
nombre cliente
teléfono
descuento
```

Por eso los pedidos deben almacenar snapshots de esos datos.

---

# 79. Soft delete de productos

No borrar productos históricos si ya aparecen en órdenes.

Preferir:

```text
is_available = false
```

o:

```text
archived_at
```

para retirarlos del menú.

Esto preserva integridad histórica.

---

# 80. Convenciones

Idioma de interfaz:

```text
Español
```

Idioma recomendado para código:

```text
Inglés
```

Ejemplo:

UI:

```text
Agregar al carrito
Mis pedidos
Marcar como entregado
```

Código:

```text
OrderCard
createOrder
customerPhone
deliveryAddress
```

---

# 81. Calidad visual

No crear únicamente:

```text
navbar + grid de cards blancas
```

Desarrollar una identidad visual real.

Agregar detalles como:

- hero gastronómico,
- fotografías protagonistas,
- badges,
- precio bien destacado,
- CTA fuerte,
- elementos gráficos sutiles,
- bloques oscuros,
- detalles rojos/mostaza,
- microinteracciones,
- hover elegante,
- transiciones suaves.

Sin perjudicar rendimiento.

---

# 82. Animaciones

Utilizar animaciones solo cuando mejoren la experiencia.

Ejemplos:

```text
hover de tarjeta
apertura del carrito
modal de pedido
entrada de toast
highlight de nueva orden
```

Mantenerlas rápidas.

Evitar páginas excesivamente animadas.

---

# 83. Orden de implementación

Implementar aproximadamente en este orden:

```text
1. Inicializar Next.js + Tailwind + TypeScript
2. Configurar Supabase
3. Crear schema y migraciones
4. Configurar RLS
5. Configurar Google Auth
6. Crear layout y diseño global
7. Crear menú de productos
8. Crear carrito
9. Crear perfiles y direcciones
10. Crear checkout
11. Implementar creación segura de órdenes
12. Implementar sistema de fidelidad
13. Crear historial del cliente
14. Crear protección admin
15. Crear dashboard admin
16. Implementar Supabase Realtime
17. Crear historial paginado y filtros
18. Agregar estados de loading/error
19. Pruebas
20. Documentación
```

---

# 84. Antes de implementar una funcionalidad

Revisar siempre:

```text
¿Necesita autenticación?
¿Necesita validación backend?
¿Necesita RLS?
¿Puede afectar precios?
¿Puede afectar descuentos?
¿Puede afectar permisos administrativos?
¿Puede producir race conditions?
```

Si la respuesta es sí, priorizar integridad y seguridad antes que conveniencia.

---

# 85. No usar mocks innecesarios

Una vez configurado Supabase:

NO dejar funcionalidades principales funcionando únicamente con arrays locales.

Usar Supabase realmente para:

```text
Productos
Usuarios
Direcciones
Órdenes
Items
Admins
Historial
Fidelidad
```

Mocks temporales son aceptables únicamente durante desarrollo inicial.

---

# 86. Objetivo final

La aplicación debe sentirse como un producto que una hamburguesería podría utilizar realmente.

El resultado final debe permitir:

```text
Cliente
  → entra al sitio
  → ve hamburguesas
  → agrega productos
  → inicia sesión con Google
  → selecciona dirección
  → realiza pedido
  → consulta historial
  → acumula fidelidad

Supabase
  → almacena usuarios
  → almacena productos
  → almacena direcciones
  → almacena órdenes
  → calcula información crítica
  → transmite eventos en tiempo real

Administrador
  → inicia sesión
  → accede al panel
  → recibe automáticamente nuevas órdenes
  → consulta todos los productos del pedido
  → identifica descuentos
  → marca órdenes como entregadas
  → consulta historial
  → filtra por fecha o producto
```

---

# 87. Criterios de finalización

No considerar el proyecto terminado hasta que:

- El menú cargue productos desde Supabase.
- Google Login funcione.
- Los perfiles se creen correctamente.
- Las direcciones estén persistidas.
- No puedan existir más de 3 direcciones por cliente.
- La última dirección usada aparezca seleccionada.
- El carrito funcione.
- El checkout funcione.
- Los precios sean calculados del lado seguro.
- Las órdenes se almacenen en Supabase.
- Los items de cada orden se almacenen.
- El sistema de fidelidad funcione.
- El descuento del 10% se aplique correctamente.
- El cliente pueda ver sus pedidos.
- `/admin` esté protegido.
- `johanleon991@gmail.com` tenga acceso administrativo.
- Los pedidos aparezcan automáticamente mediante Supabase Realtime.
- El administrador pueda abrir el detalle completo.
- El administrador pueda marcar un pedido como entregado.
- Los pedidos entregados pasen al historial.
- El historial sea paginado.
- Existan filtros por fecha y producto.
- RLS esté activado y configurado.
- Existan migraciones reproducibles.
- Exista `.env.example`.
- Exista README.
- La aplicación pase lint y build.
- La experiencia móvil sea buena.
- El diseño tenga apariencia profesional de hamburguesería.

---

# 88. Regla final para Codex

No implementar atajos inseguros solo para hacer funcionar una demo.

Cuando exista una decisión entre:

```text
solución rápida pero insegura
```

y:

```text
solución mantenible y segura
```

elegir la segunda.

Antes de dar por terminada una tarea:

```text
1. Revisar el código relacionado.
2. Revisar posibles errores de TypeScript.
3. Revisar permisos.
4. Revisar RLS cuando aplique.
5. Revisar responsive.
6. Ejecutar lint.
7. Ejecutar build.
8. Corregir errores encontrados.
```

Si algún requisito no puede completarse automáticamente debido a configuración externa, como credenciales de Google OAuth, dejar implementado todo el código correspondiente y documentar exactamente qué debe configurar el desarrollador manualmente.

No eliminar funcionalidades existentes para solucionar errores salvo que sea estrictamente necesario.

No reemplazar requisitos por versiones simplificadas sin justificación.

Mantener como prioridad:

```text
Seguridad
Integridad de datos
Experiencia del cliente
Velocidad operativa del administrador
Diseño profesional
Mantenibilidad
```