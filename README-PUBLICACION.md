# Publicar Novum Label.

## Modelo actual de compra

Novum Label funciona como catálogo y probador. El carrito agrupa productos por marca y lleva al comprador a la página oficial de cada producto; allí la marca confirma stock, talla, envío y procesa el pago. Novum Label no cobra, no recibe el dinero y no debe pedir ni almacenar datos de tarjetas. Un pedido con productos de varias marcas se finaliza por separado en cada tienda.

Las prendas de muestra sin enlace oficial son solo demostraciones y no se pueden comprar. Los precios mostrados son referenciales cuando así se indica.

## Desplegar desde GitHub en Vercel

1. Guarda y sube los cambios del proyecto a la rama `main` del repositorio de GitHub.
2. Inicia sesión en Vercel con GitHub y crea un proyecto con **Add New → Project**.
3. Importa `olayamvp/Proyecto-de-grado` y deja la raíz del proyecto en `.`.
4. Para este sitio estático, usa **Other** como preset y deja vacíos el comando de build y el directorio de salida. `index.html` está en la raíz. Vercel también detecta funciones Node.js dentro de `/api`.
5. Pulsa **Deploy**. Vercel generará una URL pública `*.vercel.app`; revisa inicio, catálogos, buscador, carrito, imágenes y probador en esa URL.
6. Si tienes un dominio propio, agrégalo desde la configuración del proyecto en Vercel y sigue allí las instrucciones DNS que Vercel muestre.

Vercel puede conectar el repositorio para que cada cambio posterior en `main` publique una nueva versión. Consulta [importar un repositorio en Vercel](https://vercel.com/docs/git) y [funciones Node.js](https://vercel.com/docs/functions/runtimes/node-js).

## Cuentas y administración

La página `/Contenido/auth/acceso.html` permite iniciar sesión o crear una cuenta de cliente. El acceso invitado sigue disponible desde la navegación; las cuentas nuevas nunca reciben rol administrador automáticamente.

Para activar cuentas y el panel de administración:

1. Crea un proyecto Supabase y ejecuta el archivo `supabase/schema.sql` completo desde **SQL Editor**.
2. En Vercel, crea las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. La última es secreta: solo se usa en funciones de servidor y no se debe publicar en HTML, JavaScript del navegador ni GitHub.
3. Despliega de nuevo y abre `/Contenido/auth/acceso.html`. Crea la cuenta que se usará para administrar. Confirma el correo si Supabase lo requiere e inicia sesión.
4. En Supabase SQL Editor, ejecuta el `insert` comentado al final de `supabase/schema.sql` con el correo exacto del administrador para asignar el rol `admin`. No se ofrece un botón público para elevar permisos.
5. Entra otra vez en Acceder. Las cuentas cliente vuelven al inicio; la cuenta administradora abre `/Contenido/auth/admin.html`. Pulsa **Importar catálogo actual** una sola vez para cargar el catálogo inicial.

Desde el panel el administrador puede cambiar nombre, precio, categoría, color, imagen, enlace oficial y visibilidad; los cambios se guardan en la base de datos. La analítica registra identificadores aleatorios de navegador, hora de actividad y producto probado, sin nombres, correo, IP ni ubicación. “Sesiones activas” cuenta navegadores con actividad en los últimos cinco minutos, así que es una aproximación, no un conteo de personas. Los contadores empiezan en cero y solo muestran actividad real registrada después de habilitar Supabase. Incluye este tratamiento en la política de privacidad antes de publicarlo.

Si Supabase no está configurado, el catálogo estático sigue funcionando como demostración, pero el inicio de sesión, el panel y las estadísticas muestran que no están disponibles. Las antiguas páginas de registro/verificación quedan separadas; no uses el flujo heredado basado en Retool para cuentas reales.

## Pagos

No se integra una pasarela única de Novum Label porque elegiste que cada marca procese su propio pedido y pago. Las compras se completan en sus sitios oficiales. Por eso Novum Label no tiene credenciales de pago ni necesita almacenarlas. Para ofrecer un pago único en el futuro, primero habría que acordar quién vende, controla inventario, envía pedidos, atiende devoluciones y recibe/distribuye el dinero.

## Revisión antes de compartir el enlace

- Confirma que GitHub contiene los cambios y que Vercel muestra un despliegue exitoso.
- Abre la URL en un celular y un computador.
- Comprueba que cada enlace de compra lleve a la marca correcta y que muestras no se puedan añadir al carrito.
- No publiques claves API en el repositorio ni actives el registro heredado hasta completar su backend seguro.
- Añade las políticas de privacidad, cambios/devoluciones, envíos y contacto con datos reales del responsable de la tienda antes de promocionar ventas.
