# Guia de seguridad, tenant y endpoints

## Que cambio en la arquitectura

- Se adopto contexto explicito de autenticacion en Application Layer con `AuthContext` (`userId`, `role`, `companyId`, etc.).
- Se endurecieron endpoints criticos: `persons`, `credentials`, `person-roles` dejaron de ser publicos para operaciones sensibles.
- Se implemento aislamiento tenant por compania en la cadena de `Person`:
  - `Person` ahora tiene `companyId` obligatorio.
  - Consultas y accesos de `Person` se filtran por `companyId` del contexto autenticado (excepto `super_admin`).
- Se implemento jerarquia de roles:
  - `super_admin`: administra companias y puede crear administradores.
  - `administrador`: administra usuarios de su propia compania (asesor/cliente).
  - `asesor` y `cliente`: sin permisos de provisionamiento.
- Se agrego `language` en `Person` (default `es`) y mensajeria i18n con fallback tecnico a `es`.

## Jerarquia operativa actual
- `super_admin` puede:
  - Crear/editar/listar/eliminar companias.
  - Crear personas en cualquier compania (body `companyId` cuando aplica).
  - Asignar rol `administrador`, `asesor` o `cliente` **en la compañía del JWT** (`POST /person-roles`).
  - Crear credenciales **en la compañía del JWT** (`POST /credentials`).
- `administrador` puede:
  - Crear personas en su compania.
  - Asignar roles `asesor` o `cliente` en su compania.
  - Crear credenciales en su compania.
- No se permite por API:
  - Asignar rol `super_admin`.
  - Operar recursos de otra compania si no eres `super_admin`.

### Provisionamiento inicial por DBA (sin login del gestor)
- El gestor de base de datos puede dar de alta la primera compañía y su administrador ejecutando el script transaccional `src/database/sql/create-company-and-admin.sql` (compañía + `persons` + `roles_people` con rol `administrador` + `credentials`).
- Ese administrador entra por `POST /auth/login` con `username`, `password` y `codeCompany` (el `code_company` generado para la compañía; el script muestra verificaciones al final).
- El flujo por API con usuario `super_admin` sigue siendo válido para entornos donde exista ese operador en la aplicación; no es obligatorio si todo el alta inicial lo hace el DBA.

## Uso actual de endpoints (resumen practico)

> Todos los endpoints protegidos requieren `Authorization: Bearer <jwt>`.

### Auth

- `POST /auth/login` (publico)
  - Body: `username`, `password`, `codeCompany`.
  - Devuelve JWT con `codeCompany` y `role`.
- `POST /auth/me` (protegido)
  - Retorna usuario autenticado.

### Companies (solo super_admin)

- `POST /companies`
- `GET /companies`
- `GET /companies/:id`
- `PUT /companies/:id`
- `DELETE /companies/:id`

Si el rol no es `super_admin`, responde `403`.

### Persons

- `POST /persons`
  - `super_admin`: puede enviar `companyId` explicito.
  - `administrador`: el sistema fuerza la compania del token.
  - Body recomendado:
    - `fullName`, `idTypeDocument`, `documentNumber`, `birthdate`,
    - `idNationality`, `phone`, `email`,
    - `language` (opcional, default `es`).
- `GET /persons`
  - Lista filtrada por tenant para no `super_admin`.
  - `super_admin` puede consultar globalmente.
- `GET /persons/:id`, `PUT /persons/:id`, `DELETE /persons/:id`
  - Respetan scope por compania.

### Person Roles

- `POST /person-roles`
  - El `code_company` de la asignación **no va en el body**: se toma del JWT (`companyId` de la sesión).
  - `super_admin` puede asignar `administrador`, `asesor`, `cliente` **en la compañía con la que inició sesión**.
  - `administrador` solo `asesor` o `cliente`.
  - Asignar rol `super_admin` por API está bloqueado.
- `GET /person-roles`
- `GET /person-roles/:id`
- `PUT /person-roles/:id`
  - No se puede cambiar de compañía por body: `code_company` permanece el de la fila existente.
- `DELETE /person-roles/:id` (misma validación de tenant que `GET` / `PUT`).

### Credentials

- `POST /credentials`
  - El `code_company` de la credencial **no va en el body**: se toma del JWT (`companyId` de la sesión).
  - La persona referenciada debe existir en esa misma compañía.
  - `administrador` y `super_admin` quedan acotados a la compañía de la sesión en este alta.
- `GET /credentials`
- `GET /credentials/:id`
- `PUT /credentials/:id`
  - No se puede cambiar de compañía por body: `code_company` permanece el de la credencial existente.
- `DELETE /credentials/:id`
  - Con validacion por compania.

## i18n en comunicaciones salientes

- Textos de correo: **nestjs-i18n** con archivos JSON por locale (`src/i18n/<locale>/email.json`). Fallback de idioma: **es**.
- Locales soportados actualmente: `es`, `en`, `pt` (ampliables añadiendo carpetas y JSON).
- `Person.language` ajusta el locale cuando existe persona en contexto (p. ej. bienvenida, OTP tras resolver credencial).
- `POST /auth/send-otp`: si la persona no tiene idioma útil en BD, se considera el header **Accept-Language** (`resolveEmailLanguageFromSources` en `supported-email-locales.ts`).
- Maquetación HTML compartida: `src/infrastructure/email/templates/email/layout.hbs` y `footer.hbs` (sin duplicar por idioma).
- Sustitución de variables en traducciones: formato `{nombreVariable}` (motor por defecto de nestjs-i18n). Punto de extensión para traducción automática: `MachineTranslationPort` en dominio (sin implementación por defecto).

## Errores esperados (referencia)

- `403 FORBIDDEN_ROLE_SCOPE`: rol sin permiso para la operacion.
- `403 FORBIDDEN_COMPANY_SCOPE`: intento de operar fuera del tenant.
- `404 PERSON_NOT_FOUND` / `ROLE_NOT_FOUND` / `COMPANY_NOT_FOUND`: entidad no existe en el alcance permitido.

## Troubleshooting: ER_NO_REFERENCED_ROW_2 al arrancar (FK persons -> companies)

Si `synchronize: true` intenta crear `FOREIGN KEY (code_company) REFERENCES companies(code_company)` y MySQL devuelve **1452 / ER_NO_REFERENCED_ROW_2**, hay filas en `persons` cuyo `code_company` **no existe** en `companies`.

1. Ejecuta el diagnostico en `src/database/sql/fix-persons-code-company-fk.sql`.
2. Corrige datos (alinear `persons.code_company` a una compania real, o crear compania y actualizar).
3. Reinicia la aplicacion para que TypeORM complete el `ALTER TABLE`.

**Importante:** cualquier inserción manual en `persons` debe usar un `code_company` que exista en `companies` (por ejemplo tras crear la compañía con `create-company-and-admin.sql`).
