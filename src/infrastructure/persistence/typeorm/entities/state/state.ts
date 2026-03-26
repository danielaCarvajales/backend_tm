import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "../company/company";
import { Credentials } from "../credentials/credentials";
import { CasePerson } from "../case-person/case-person";
import { PersonRole } from "../person-role/person-role";

@Entity("states", { schema: "public" })
export class State {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_state" })
    public idState: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public nameState: string;

    @OneToMany(() => Company, (company) => company.state)
    public companies?: Company[];

    @OneToMany(() => Credentials, (credentials) => credentials.stateCredential)
    public credentials?: Credentials[];

    @OneToMany(() => CasePerson, (casePerson) => casePerson.state)
    public casePersons?: CasePerson[];

    @OneToMany(() => PersonRole, (personRole) => personRole.state)
    public personRoles?: PersonRole[];

    constructor(idState: number, nameState: string) {
        this.idState = idState;
        this.nameState = nameState;
    }
}
