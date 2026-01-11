# Guía de Prueba de Mercado Pago

## 🎯 Objetivo
Esta guía te ayudará a simular una compra completa usando Mercado Pago en modo de prueba.

## 📋 Pre-requisitos

1. **Credenciales de Mercado Pago configuradas** en `.env.local`:
   - `MP_ACCESS_TOKEN`: Tu token de acceso de prueba de Mercado Pago
   - `NEXT_PUBLIC_BASE_URL`: URL de tu aplicación (ej: http://localhost:3000)

2. **Credenciales de WordPress configuradas** en `.env.local`:
   - `NEXT_PUBLIC_WORDPRESS_URL`: URL de tu WordPress
   - `WP_ADMIN_USER`: Usuario admin de WordPress
   - `WP_ADMIN_APP_PASSWORD`: Contraseña de aplicación de WordPress

3. **Usuario registrado** en tu aplicación con un email válido

4. **Campo ACF configurado** en WordPress:
   - Nombre del campo: `purchased_courses`
   - Tipo: Relationship o Post Object (múltiple)
   - Ubicación: User

## 🚀 Pasos para Probar

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Iniciar sesión en la aplicación

- Ve a tu aplicación (http://localhost:3000)
- Inicia sesión con un usuario registrado
- **IMPORTANTE**: Anota el email del usuario que usarás

### 3. Ir a la página de prueba

Navega a: **http://localhost:3000/test-checkout**

### 4. Completar el formulario de prueba

- **ID del Curso**: Ingresa el slug de un curso existente en WordPress (ej: `curso-ejemplo`)
- **Título**: El nombre del curso (ej: "Curso de Prueba")
- **Precio**: Un monto en pesos argentinos (ej: `1000`)

### 5. Crear la preferencia de pago

- Haz clic en "Crear Preferencia de Pago"
- Deberías ver un resultado exitoso con un link a Mercado Pago
- **Copia el Preference ID** para referencia

### 6. Completar el pago en Mercado Pago

Haz clic en el link de Mercado Pago y usa estas credenciales de prueba:

**Tarjeta aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123` (cualquier 3 dígitos)
- Vencimiento: `11/25` (cualquier fecha futura)
- Nombre del titular: `APRO`
- DNI: `12345678`

**Otros escenarios de prueba:**
- Nombre `CONT`: Pago pendiente
- Nombre `OTHE`: Rechazado por error general
- Nombre `CALL`: Rechazado con validación

### 7. Verificar el webhook

Después de completar el pago, revisa los logs del servidor:

```bash
# En la terminal donde corre npm run dev
# Deberías ver:
=== WEBHOOK MERCADO PAGO ===
Timestamp: [fecha]
Processing payment ID: [id]
Payment data received:
- Status: approved
- External Reference (Course ID): curso-ejemplo
- Payer Email: tu-email@ejemplo.com
✅ Payment approved, processing course assignment...
User found - ID: [user_id]
✅ Course curso-ejemplo successfully added to user [user_id]
=== WEBHOOK COMPLETED ===
```

### 8. Verificar en WordPress

1. Ve al panel de administración de WordPress
2. Navega a **Usuarios** → Selecciona el usuario que hizo la compra
3. Busca el campo ACF `purchased_courses`
4. **Verifica que el curso aparezca en la lista**

### 9. Verificar en la aplicación

1. Ve a la página "Mis Cursos" en tu aplicación
2. El curso comprado debería aparecer ahí

## 🐛 Solución de Problemas

### El webhook no se ejecuta

**Problema**: No ves logs del webhook después del pago

**Soluciones**:
1. Verifica que `NEXT_PUBLIC_BASE_URL` esté configurado correctamente
2. Si estás en localhost, Mercado Pago no puede alcanzar tu webhook
3. Usa **ngrok** o **localtunnel** para exponer tu localhost:
   ```bash
   npx localtunnel --port 3000
   # Copia la URL y actualiza NEXT_PUBLIC_BASE_URL
   ```

### El curso no se asigna al usuario

**Problema**: El webhook se ejecuta pero el curso no aparece

**Soluciones**:
1. Revisa los logs del webhook para ver errores específicos
2. Verifica que el campo ACF `purchased_courses` exista en WordPress
3. Verifica que el slug del curso coincida exactamente con el ID del curso en WordPress
4. Verifica las credenciales de WordPress (`WP_ADMIN_USER` y `WP_ADMIN_APP_PASSWORD`)

### Error "Email de usuario requerido"

**Problema**: El checkout falla con este error

**Soluciones**:
1. Asegúrate de estar autenticado
2. Verifica que tu sesión tenga un email válido
3. Recarga la página e intenta nuevamente

### Error "Invalid price"

**Problema**: El precio no es válido

**Soluciones**:
1. Usa solo números (sin símbolos como $ o ,)
2. El precio debe ser mayor a 0
3. Ejemplo válido: `1000` o `5000.50`

## 📊 Logs Importantes

### Logs del Checkout (Frontend)
```javascript
Iniciando compra para: {
  courseId: "curso-ejemplo",
  title: "Curso de Prueba",
  price: "1000",
  email: "usuario@ejemplo.com"
}
```

### Logs del API Checkout (Backend)
```javascript
Checkout request body: { id: "curso-ejemplo", title: "Curso de Prueba", price: "1000", userEmail: "usuario@ejemplo.com" }
Parsed price: 1000
Creating preference with data: { ... }
Preference created successfully: 1234567890
```

### Logs del Webhook (Backend)
```javascript
=== WEBHOOK MERCADO PAGO ===
Timestamp: 2026-01-10T21:30:00.000Z
Processing payment ID: 1234567890
✅ Payment approved, processing course assignment...
User found - ID: 5
✅ Course curso-ejemplo successfully added to user 5
=== WEBHOOK COMPLETED ===
```

## 🔍 Verificación Manual del Webhook

Si quieres probar el webhook manualmente sin hacer un pago real:

1. Obtén un Payment ID de prueba de Mercado Pago
2. Usa una herramienta como Postman o curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "PAYMENT_ID_AQUI"
    }
  }'
```

## ✅ Checklist de Verificación

- [ ] Servidor de desarrollo corriendo
- [ ] Usuario autenticado en la aplicación
- [ ] Variables de entorno configuradas
- [ ] Campo ACF `purchased_courses` creado en WordPress
- [ ] Preferencia de pago creada exitosamente
- [ ] Pago completado en Mercado Pago
- [ ] Webhook recibido y procesado
- [ ] Curso asignado al usuario en WordPress
- [ ] Curso visible en "Mis Cursos"

## 📞 Recursos Adicionales

- [Documentación de Mercado Pago - Testing](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)
- [Credenciales de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)
- [Webhooks de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/notifications/webhooks)
