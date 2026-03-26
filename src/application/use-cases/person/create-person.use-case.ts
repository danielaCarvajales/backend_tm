import { Inject, Injectable } from '@nestjs/common';
import { Person } from '../../../domain/entities/person.entity';
import { PersonService } from '../../../domain/services/person.service';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CreatePersonDto } from '../../dto/person/create-person.dto';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

const MAX_UNIQUE_CODE_ATTEMPTS = 10;

@Injectable()
export class CreatePersonUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
    private readonly personService: PersonService,
  ) {}

  async execute(dto: CreatePersonDto): Promise<Person> {
    const personCode = await this.generateUniquePersonCode(dto.fullName);
    const entity = new Person(
      undefined,
      personCode,
      dto.fullName,
      dto.idTypeDocument,
      dto.documentNumber,
      new Date(dto.birthdate),
      dto.idNationality,
      dto.phone,
      dto.email,
    );
    return this.repository.save(entity);
  }

  private async generateUniquePersonCode(fullName: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_UNIQUE_CODE_ATTEMPTS; attempt++) {
      const code = this.personService.generatePersonCode(fullName);
      const existing = await this.repository.findByPersonCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('PERSON_CODE_GENERATION_FAILED');
  }
}
