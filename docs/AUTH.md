# Módulo de Autenticación

## Resumen

Sistema de autenticación seguro con JWT, protección contra fuerza bruta, auditoría y roles (administrador, asesor, cliente).

## Configuración

1. Copiar `.env.example` a `.env`
2. Generar `JWT_SECRET` (mín. 64 caracteres):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Asegurar que las contraseñas en `credentials` estén hasheadas con bcrypt (cost 12). Las credenciales creadas/actualizadas por la API se hashean automáticamente.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Público | Login (username, password, codeCompany) |
| POST | `/api/auth/me` | JWT | Usuario actual |
| GET | `/api/auth/admin-only` | JWT + administrador | Ejemplo endpoint solo administrador |

## Uso de Guards

```typescript
// Ruta pública (sin JWT)
@Public()
@Post('login')
login() { ... }

// Ruta protegida (cualquier usuario autenticado)
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) { ... }

// Ruta solo para administrador
@UseGuards(RolesGuard)
@Roles('administrador')
@Get('admin')
adminOnly() { ... }

// Ruta para administrador o asesor
@UseGuards(RolesGuard)
@Roles('administrador', 'asesor')
@Get('advisors')
advisorsOnly() { ... }
```

## Flujo de Login

1. Buscar credentials por `username` + `codeCompany`
2. Verificar `accountLockedUntil` (bloqueo por intentos fallidos)
3. Comparar password con bcrypt (tiempo constante)
4. Si falla: incrementar `failedAttempts`, bloquear 5 min si ≥ 3 intentos
5. Si éxito: resetear intentos, actualizar `lastAccess`
6. Obtener rol activo de `person_role`
7. Generar JWT (24h, HS256)

## Seguridad

- **Contraseñas**: bcrypt cost 12, política: 8+ chars, 1 mayúscula, 1 número, 1 símbolo
- **JWT**: HS256, 24h, payload sin datos sensibles
- **Fuerza bruta**: 3 intentos → bloqueo 5 min
- **Auditoría**: `auth_audit_log` registra login exitoso/fallido + IP
