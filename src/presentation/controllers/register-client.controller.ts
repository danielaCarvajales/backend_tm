import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthContext } from '../../application/auth/auth-context';
import { RegisterClientWithCaseDto } from '../../application/dto/client-registration/register-client-with-case.dto';
import { RegisterClientWithCaseUseCase } from '../../application/use-cases/client-registration/register-client-with-case.use-case';
import { AuthContextUser } from '../../infrastructure/auth/decorators/auth-context.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';

@Controller('client-registrations')
export class RegisterClientController {
  constructor(
    private readonly registerClientWithCase: RegisterClientWithCaseUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async register(
    @Body() dto: RegisterClientWithCaseDto,
    @AuthContextUser() ctx: AuthContext,
  ) {
    try {
      const result = await this.registerClientWithCase.execute(dto, ctx);
      return {
        message: 'Cliente y caso registrados correctamente',
        data: {
          idPerson: result.person.idPerson,
          idPersonRole: result.personRole.idPersonRole,
          idCredentials: result.credentials.id,
          idCustomerProfile: result.customerProfile.idCustomerProfile,
          idCase: result.caseRecord.idCase,
          caseCode: result.caseRecord.caseCode,
        },
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_CODE_GENERATION_FAILED') {
        throw new ConflictException(
          'No se pudo generar un código de persona único. Intente nuevamente.',
        );
      }
      if (err instanceof Error && err.message === 'CLIENT_ROLE_NOT_FOUND') {
        throw new NotFoundException('Rol de cliente no configurado en el sistema');
      }
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException('No tiene permisos para registrar clientes');
      }
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Titular no encontrado en la compañía');
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_ALREADY_EXISTS_FOR_HOLDER'
      ) {
        throw new ConflictException('La persona ya tiene un caso en esta compañía');
      }
      if (
        err instanceof Error &&
        err.message === 'SERVICE_COMPANY_NOT_FOUND'
      ) {
        throw new NotFoundException(
          'Uno o más servicios no existen en la compañía',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_CODE_GENERATION_FAILED'
      ) {
        throw new ConflictException(
          'No se pudo generar un código de caso único. Intente nuevamente.',
        );
      }
      throw err;
    }
  }
}
