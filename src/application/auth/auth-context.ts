export interface AuthContext {
  userId: number;
  email: string;
  credentialId: number;
  companyId: number;
  role: string;
  idPersonRole?: number;
}

const COMPANY_ADMIN_ROLE = 'administrador';
const ADVISOR_ROLE = 'asesor';

export function isCompanyAdmin(context: AuthContext): boolean {
  return context.role.trim().toLowerCase() === COMPANY_ADMIN_ROLE;
}

export function isAdvisor(context: AuthContext): boolean {
  return context.role.trim().toLowerCase() === ADVISOR_ROLE;
}

export function ensureCompanyAccess(
  context: AuthContext,
  targetCompanyId: number,
): void {
  if (context.companyId !== targetCompanyId) {
    throw new Error('FORBIDDEN_COMPANY_SCOPE');
  }
}

/**
 * Alta/gestión de compañías a nivel plataforma: no hay rol de aplicación para ello;
 * lo hace el gestor de BD (scripts / consola). La API no expone este privilegio vía JWT.
 */
export function ensureSuperAdmin(_context: AuthContext): void {
  throw new Error('FORBIDDEN_ROLE_SCOPE');
}

/** Administrador o asesor: gestión de personas, credenciales y roles en su tenant. */
export function ensureCanManageCompanyUsers(context: AuthContext): void {
  if (isCompanyAdmin(context) || isAdvisor(context)) {
    return;
  }
  throw new Error('FORBIDDEN_ROLE_SCOPE');
}
