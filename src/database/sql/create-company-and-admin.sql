-- Provisionamiento DBA: nueva compañía + primer administrador (Person + rol + credenciales).
-- Motor: MySQL
-- Tablas: companies, role, persons, roles_people, credentials
--
-- Flujo operativo:
-- 1) Ajusta el bloque PARAMETROS.
-- 2) Genera el hash bcrypt con el mismo algoritmo/costo que la app (ver password.util).
-- 3) Ejecuta el script completo (una transacción).
-- 4) El administrador inicia sesión vía POST /auth/login con username, password y codeCompany.
--

START TRANSACTION;

-- =========================
-- PARAMETROS (AJUSTAR)
-- =========================
SET @p_name_company    := 'Tramites Migratorios Dos EU';
SET @p_prefix_company  := 'TMD'; 

SET @p_full_name         := 'Diana Estela Rios caceres';
SET @p_document_number   := 'ADM-0001';
SET @p_email             := 'dianaestelarioscaceres@gmail.com';
SET @p_phone             := '+573001234567';
SET @p_birthdate         := '1990-01-01';
SET @p_language          := 'es';
SET @p_person_code       := 'DERC-0001'; -- iniciales del nombre de persona  + 5 digitos aleatorios
SET @p_username          := 'dianaestelarioscaceres@gmail.com';

-- Hash bcrypt compatible con el backend. Reemplazar por el generado para tu contraseña.
SET @p_bcrypt_password   := '$2b$12$06KwF56Uy.96WE8CmPZJxOjfSxJvolhoX1ppnabZ0ZggmWgQgjaXC';

SET @p_id_type_document  := 1;
SET @p_id_nationality    := 1;

-- =========================
-- Compañía (idempotente por prefijo)
-- =========================
INSERT INTO companies (name_company, prefix_company, state_company)
SELECT @p_name_company, @p_prefix_company, 1
WHERE NOT EXISTS (
  SELECT 1 FROM companies c WHERE c.prefix_company = @p_prefix_company
);

SET @v_code_company := (
  SELECT c.code_company
  FROM companies c
  WHERE c.prefix_company = @p_prefix_company
  LIMIT 1
);

-- =========================
-- Rol administrador (catálogo)
-- =========================
INSERT INTO role (`name`)
SELECT 'administrador'
WHERE NOT EXISTS (
  SELECT 1 FROM role r WHERE LOWER(TRIM(r.`name`)) = 'administrador'
);

SET @v_id_role_admin := (
  SELECT r.id_role
  FROM role r
  WHERE LOWER(TRIM(r.`name`)) = 'administrador'
  LIMIT 1
);

-- =========================
-- Persona
-- =========================
INSERT INTO persons (
  person_code,
  full_name,
  code_company,
  id_type_document,
  document_number,
  birthdate,
  id_nationality,
  phone,
  email,
  language
)
SELECT
  @p_person_code,
  @p_full_name,
  @v_code_company,
  @p_id_type_document,
  @p_document_number,
  @p_birthdate,
  @p_id_nationality,
  @p_phone,
  @p_email,
  @p_language
WHERE NOT EXISTS (
  SELECT 1
  FROM persons p
  WHERE p.email = @p_email
    AND p.code_company = @v_code_company
);

SET @v_id_person := (
  SELECT p.id_person
  FROM persons p
  WHERE p.email = @p_email
    AND p.code_company = @v_code_company
  LIMIT 1
);

-- =========================
-- Asignación de rol (activa)
-- =========================
INSERT INTO roles_people (
  id_person,
  id_role,
  code_company,
  id_state,
  assignment_date,
  revocation_date
)
SELECT
  @v_id_person,
  @v_id_role_admin,
  @v_code_company,
  1,
  NOW(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM roles_people rp
  WHERE rp.id_person = @v_id_person
    AND rp.id_role = @v_id_role_admin
    AND rp.code_company = @v_code_company
    AND rp.id_state = 1
    AND rp.revocation_date IS NULL
);

-- =========================
-- Credenciales (login)
-- =========================
INSERT INTO credentials (
  username,
  password,
  state,
  last_access,
  id_person,
  code_company,
  failed_attempts,
  account_locked_until
)
SELECT
  @p_username,
  @p_bcrypt_password,
  1,
  NOW(),
  @v_id_person,
  @v_code_company,
  0,
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM credentials c
  WHERE c.username = @p_username
    AND c.code_company = @v_code_company
);

COMMIT;

-- =========================
-- Verificación
-- =========================
SELECT c.code_company, c.name_company, c.prefix_company, c.state_company
FROM companies c
WHERE c.code_company = @v_code_company;

SELECT p.id_person, p.person_code, p.full_name, p.email, p.code_company, p.language
FROM persons p
WHERE p.id_person = @v_id_person;

SELECT rp.id_person_role, rp.id_person, rp.id_role, r.`name` AS role_name, rp.code_company, rp.id_state
FROM roles_people rp
INNER JOIN role r ON r.id_role = rp.id_role
WHERE rp.id_person = @v_id_person
  AND rp.code_company = @v_code_company
  AND rp.revocation_date IS NULL;

SELECT c.id_credential, c.username, c.id_person, c.code_company, c.state
FROM credentials c
WHERE c.id_person = @v_id_person
  AND c.code_company = @v_code_company;
