# ⚠️ IMPORTANTE: Reiniciar el Servidor

## El servidor NO ha cargado las nuevas credenciales

Acabamos de detectar que el servidor sigue usando las credenciales de PRODUCCIÓN.

## 🔄 Cómo Reiniciar el Servidor

### Opción 1: Desde la Terminal de VS Code

1. Ve a la terminal donde está corriendo `npm run dev`
2. Presiona `Ctrl + C` para detener el servidor
3. Espera a que se detenga completamente
4. Ejecuta nuevamente: `npm run dev`

### Opción 2: Desde PowerShell/CMD

Si no encuentras la terminal, puedes forzar el cierre:

```powershell
# Detener todos los procesos de Node
Get-Process -Name node | Stop-Process -Force

# Espera 2 segundos
Start-Sleep -Seconds 2

# Inicia el servidor nuevamente
cd C:\Users\Usuario\mundoinformatica
npm run dev
```

## ✅ Verificación

Después de reiniciar, verifica que las credenciales se cargaron correctamente:

1. Abre tu navegador
2. Ve a: http://localhost:3000/api/check-mp-credentials
3. Deberías ver:
   ```json
   {
     "tokenType": "TEST (Prueba)",
     "isTest": true,
     "isProduction": false
   }
   ```

## 🎯 Siguiente Paso

Una vez que veas que `isTest: true`, entonces podrás:

1. Ir a `/test-checkout`
2. Crear una preferencia de pago
3. Completar el pago con las credenciales de prueba
4. ¡El webhook debería funcionar correctamente!

---

**NOTA**: Los archivos `.env.local` solo se leen cuando el servidor inicia. Cualquier cambio requiere reiniciar el servidor.
