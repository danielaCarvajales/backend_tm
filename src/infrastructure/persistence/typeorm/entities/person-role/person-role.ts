import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../role/role";
import { Company } from "../company/company";
import { Person } from "../person/person";
import { State } from "../state/state";
import { CustomerProfile } from "../customer-profile/customer-profile";

@Entity("roles_people")
export class PersonRole {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_person_role" })
    public idPersonRole: number;

    @Column({ type: "integer", name: "id_person", nullable: false })
    public idPerson: number;

    @Column({ type: "integer", name: "id_role", nullable: false })
    public idRole: number;

    @Column({ type: "integer", name: "code_company", nullable: false })
    public codeCompany: number;

    @Column({ type: "integer", name: "id_state", nullable: false, default: 1 })
    public idState: number;

    @Column({ type: "timestamp", name: "assignment_date", nullable: false })
    public assignmentDate: Date;

    @Column({ type: "timestamp", name: "revocation_date", nullable: true })
    public revocationDate?: Date;

    @ManyToOne(() => Person, (person) => person.personRole, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_person" }])
    public person?: Person;

    @ManyToOne(() => Role, (role) => role.personRole, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_role" }])
    public role?: Role;

    @ManyToOne(() => Company, (company) => company.personRole, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "code_company" }])
    public company?: Company;

    @ManyToOne(() => State, (state) => state.personRoles, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_state" }])
    public state?: State;

    @OneToMany(() => CustomerProfile, (cp) => cp.personRole)
    public customerProfiles?: CustomerProfile[];

    constructor(
        idPerson: number,
        idRole: number,
        codeCompany: number,
        idState: number,
        assignmentDate: Date,
        revocationDate?: Date,
    ) {
        this.idPerson = idPerson;
        this.idRole = idRole;
        this.codeCompany = codeCompany;
        this.idState = idState;
        this.assignmentDate = assignmentDate;
        this.revocationDate = revocationDate;
    }
}
