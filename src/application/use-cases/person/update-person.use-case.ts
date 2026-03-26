import { Inject, Injectable } from '@nestjs/common';
import { Person } from '../../../domain/entities/person.entity';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { UpdatePersonDto } from '../../dto/person/update-person.dto';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

@Injectable()
export class UpdatePersonUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(idPerson: number, dto: UpdatePersonDto): Promise<Person> {
    const existing = await this.repository.findById(idPerson);
    if (!existing) {
      throw new Error('PERSON_NOT_FOUND');
    }
    const updated = new Person(
      idPerson,
      existing.personCode,
      dto.fullName ?? existing.fullName,
      dto.idTypeDocument ?? existing.idTypeDocument,
      dto.documentNumber ?? existing.documentNumber,
      dto.birthdate ? new Date(dto.birthdate) : existing.birthdate,
      dto.idNationality ?? existing.idNationality,
      dto.phone ?? existing.phone,
      dto.email ?? existing.email,
    );
    return this.repository.update(updated);
  }
}
