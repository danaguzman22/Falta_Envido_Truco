# 🔐 Setup de Administradores - Guía Rápida

## Primer Setup: Agregar tu Email a la Whitelist

### Paso 1: Editar `data/tournament-db.json`

Abre el archivo `data/tournament-db.json` y busca la sección `"admins": []`.

Reemplázala con:

```json
"admins": [
  {
    "email": "tu-email@utn.edu.ar",
    "passwordHash": null,
    "status": "pendiente",
    "creadoEn": "2026-04-29T00:00:00.000Z",
    "ultimoIngresoEn": null
  }
]
```

### Paso 2: Acceder a `/admin`

1. Ve a `http://localhost:3000/admin`
2. Ingresa:
   - **Email**: `tu-email@utn.edu.ar` (exactamente como lo pusiste en el JSON)
   - **Contraseña**: La que quieras (mínimo 6 caracteres)
3. El sistema detectará que es tu **primer ingreso** y:
   - ✅ Validará que tu email esté en la whitelist
   - ✅ Creará una cuenta activa
   - ✅ Hasheará tu contraseña (bcryptjs)
   - ✅ Te logueará automáticamente

### Paso 3: Ya estás dentro

Ahora tienes acceso al panel de administración en `/admin`.

## Agregar Más Administradores

### Opción A: Manualmente (Editar JSON)

1. Abre `data/tournament-db.json`
2. Agrega nuevos admins al array:

```json
{
  "email": "nuevo-admin@utn.edu.ar",
  "passwordHash": null,
  "status": "pendiente",
  "creadoEn": "2026-04-29T00:00:00.000Z",
  "ultimoIngresoEn": null
}
```

3. El nuevo admin puede acceder a `/admin` con su email y crear su contraseña.

### Opción B: Desde el Panel (API)

Una vez dentro, puedes hacer POST a `/api/admin/whitelist` para agregar nuevos admins:

```bash
curl -X POST http://localhost:3000/api/admin/whitelist \
  -H "Content-Type: application/json" \
  -b "utn_admin_session=tu-email@utn.edu.ar" \
  -d '{"email": "nuevo-admin@utn.edu.ar"}'
```

## 🔄 Flujo de Primer Ingreso vs Login Regular

| Evento | Email en DB | passwordHash | Acción |
|--------|-------------|--------------|--------|
| Primer acceso | ✅ Sí | `null` | Crea contraseña y se activa |
| Login regular | ✅ Sí | `hash` | Verifica contraseña |
| Email no autorizado | ❌ No | - | Error: "No eres administrador autorizado" |

## 🚨 Importante

- **Las contraseñas nunca se guardan en plain text** — se hashean con bcryptjs
- **El `passwordHash` es lo único que se guarda** en el JSON
- **La cookie de sesión expira en 8 horas** (configurable en `/api/admin/login`)
- **httpOnly cookie** — no se puede acceder desde JavaScript

## 📍 Archivos Clave

- `lib/repository.ts` → `adminRepository` (lógica de autenticación)
- `lib/password.ts` → `hashPassword()`, `verifyPassword()` (bcryptjs)
- `lib/auth.ts` → `getAdminEmail()`, `isAdminAuthenticated()` (sesión)
- `app/api/admin/login/route.ts` → maneja login y registro
- `app/api/admin/whitelist/route.ts` → agrega nuevos admins

## ❓ Troubleshooting

### "Acceso denegado. No eres un administrador autorizado"
→ Tu email no está en la whitelist de `tournament-db.json`. Agrégalo.

### "Esta cuenta ya tiene contraseña"
→ Ya creaste una. Si olvidaste la contraseña, elimina el `passwordHash` en el JSON y vuelve a intentar.

### "La contraseña debe tener al menos 6 caracteres"
→ Usa una contraseña más larga.

## 🎯 Próximos Pasos

1. Setup del primer admin ✅
2. Agregar más admins en la whitelist
3. El sistema de registro de equipos sigue funcionando igual
4. El panel de admin funciona con el nuevo sistema de auth
