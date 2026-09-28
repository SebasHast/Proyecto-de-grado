# Publicar CLOTHES.

## Modelo actual de compra

CLOTHES funciona como catálogo y probador. El carrito agrupa productos por marca y lleva al comprador a la página oficial de cada producto; allí la marca confirma stock, talla, envío y procesa el pago. CLOTHES no cobra, no recibe el dinero y no debe pedir ni almacenar datos de tarjetas. Un pedido con productos de varias marcas se finaliza por separado en cada tienda.

Las prendas de muestra sin enlace oficial son solo demostraciones y no se pueden comprar. Los precios mostrados son referenciales cuando así se indica.

## Desplegar desde GitHub en Vercel

1. Guarda y sube los cambios del proyecto a la rama `main` del repositorio de GitHub.
2. Inicia sesión en Vercel con GitHub y crea un proyecto con **Add New → Project**.
3. Importa `olayamvp/Proyecto-de-grado` y deja la raíz del proyecto en `.`.
4. Para este sitio estático, usa **Other** como preset y deja vacíos el comando de build y el directorio de salida. `index.html` está en la raíz. Vercel también detecta funciones Node.js dentro de `/api`.
5. Pulsa **Deploy**. Vercel generará una URL pública `*.vercel.app`; revisa inicio, catálogos, buscador, carrito, imágenes y probador en esa URL.
6. Si tienes un dominio propio, agrégalo desde la configuración del proyecto en Vercel y sigue allí las instrucciones DNS que Vercel muestre.

Vercel puede conectar el repositorio para que cada cambio posterior en `main` publique una nueva versión. Consulta [importar un repositorio en Vercel](https://vercel.com/docs/git) y [funciones Node.js](https://vercel.com/docs/functions/runtimes/node-js).

## Correo y cuentas

`api/send-confirmation.js` utiliza Resend. Para configurarlo se necesita una cuenta Resend, una clave API y un dominio de envío verificado. En Vercel, configura `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en **Project → Settings → Environment Variables** y vuelve a desplegar. La dirección remitente debe pertenecer al dominio que verifiques en Resend; `noreply@tudominio.com` es solo un ejemplo y no funcionará.

El registro actual todavía usa un servicio Retool público y guarda el código de verificación desde el navegador. No actives el endpoint de correo ni promociones cuentas reales hasta reemplazar esa verificación por una función de backend con almacenamiento privado, expiración validada en servidor y protección contra abuso. `ENABLE_EMAIL_VERIFICATION` queda desactivado por defecto.

## Pagos

No se integra una pasarela única de CLOTHES porque elegiste que cada marca procese su propio pedido y pago. Las compras se completan en sus sitios oficiales. Por eso CLOTHES no tiene credenciales de pago ni necesita almacenarlas. Para ofrecer un pago único en el futuro, primero habría que acordar quién vende, controla inventario, envía pedidos, atiende devoluciones y recibe/distribuye el dinero.

## Revisión antes de compartir el enlace

- Confirma que GitHub contiene los cambios y que Vercel muestra un despliegue exitoso.
- Abre la URL en un celular y un computador.
- Comprueba que cada enlace de compra lleve a la marca correcta y que muestras no se puedan añadir al carrito.
- No publiques claves API en el repositorio ni actives el registro heredado hasta completar su backend seguro.
- Añade las políticas de privacidad, cambios/devoluciones, envíos y contacto con datos reales del responsable de la tienda antes de promocionar ventas.
