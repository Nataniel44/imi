# Cómo Obtener las Credenciales de Prueba de Mercado Pago

## 🎯 Problema
Error: "Una de las partes con la que intentás hacer el pago es de prueba"

Este error ocurre cuando mezclas credenciales de producción con credenciales de prueba.

## ✅ Solución

### Paso 1: Ir al Panel de Desarrolladores de Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Inicia sesión con tu cuenta de Mercado Pago

### Paso 2: Crear o Seleccionar una Aplicación

1. Si no tienes una aplicación, haz clic en "Crear aplicación"
2. Selecciona "Checkout Pro" o "Pagos online"
3. Dale un nombre (ej: "Mundo Informática - Testing")

### Paso 3: Obtener las Credenciales de Prueba

1. En el panel de tu aplicación, busca la sección **"Credenciales de prueba"**
2. Verás dos tokens:
   - **Public Key** (empieza con `TEST-`)
   - **Access Token** (empieza con `TEST-`)

3. **Copia el Access Token de prueba** (el que empieza con `TEST-`)

### Paso 4: Actualizar tu .env.local

Reemplaza tu `MP_ACCESS_TOKEN` actual con el token de prueba:

```env
# ANTES (Producción - NO usar para pruebas)
MP_ACCESS_TOKEN=APP_USR-8468505777063569-010911-1bb7841ee14f5682e04a7d16c676db5b-3122550241

# DESPUÉS (Prueba - Usar para testing)
MP_ACCESS_TOKEN=TEST-1234567890123456-010101-abcdef1234567890abcdef1234567890-123456789
```

### Paso 5: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciarlo
npm run dev
```

## 🔍 Verificación

Tu token de prueba debe:
- ✅ Empezar con `TEST-`
- ✅ Tener aproximadamente 80-100 caracteres
- ✅ Estar en la sección "Credenciales de prueba" del panel

## 📝 Diferencias entre Tokens

| Tipo | Prefijo | Uso | Pagos Reales |
|------|---------|-----|--------------|
| **Prueba** | `TEST-` | Testing y desarrollo | ❌ No (simulados) |
| **Producción** | `APP_USR-` | Aplicación en vivo | ✅ Sí (reales) |

## ⚠️ IMPORTANTE

- **NUNCA** uses credenciales de producción para pruebas
- **NUNCA** compartas tus credenciales de producción
- Los pagos con credenciales de prueba **NO son reales**
- Los pagos con credenciales de producción **SÍ son reales** y cobran dinero

## 🧪 Después de Actualizar

1. Reinicia el servidor
2. Ve a `/test-checkout`
3. Crea una nueva preferencia
4. Usa las credenciales de prueba para pagar:
   - Tarjeta: `5031 7557 3453 0604`
   - Nombre: `APRO`
   - CVV: `123`
   - Vencimiento: cualquier fecha futura

## 🔗 Enlaces Útiles

- Panel de Desarrolladores: https://www.mercadopago.com.ar/developers/panel
- Documentación de Credenciales: https://www.mercadopago.com.ar/developers/es/docs/credentials
- Tarjetas de Prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards
