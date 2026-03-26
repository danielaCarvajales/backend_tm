import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "../person/person";
import { CaseRecord } from "../case-record/case-record";
import { FamilyRelationship } from "../family-relationship/family-relationship";
import { State } from "../state/state";

@Entity('case_people', { schema: 'public' })
export class CasePerson {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_case_person" })
    public idCasePerson: number;

    @Column({ type: "integer", name: "id_case", nullable: false })
    public idCase: number;

    @Column({ type: "integer", name: "id_person", nullable: false })
    public idPerson: number;

    @Column({ type: "integer", name: "id_family_relationship", nullable: false })
    public idFamilyRelationship: number;

    @Column({ type: "integer", name: "state_person", nullable: false })
    public statePerson: number;

    @Column({ type: "timestamp", name: "created_at", nullable: false })
    public createdAt: Date;

    @Column({ type: "text", name: "observation", nullable: true })
    public observation: string;

    @ManyToOne(() => CaseRecord, (caseRecord) => caseRecord.casePersons, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_case" }])
    public caseRecord?: CaseRecord;

    @ManyToOne(() => Person, (person) => person.casePersons, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_person" }])
    public person?: Person;

    @ManyToOne(() => FamilyRelationship, (familyRelationship) => familyRelationship.casePersons, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_family_relationship" }])
    public familyRelationship?: FamilyRelationship;

    @ManyToOne(() => State, (state) => state.casePersons, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "state_person" }])
    public state?: State;


    constructor(idCasePerson: number, idCase: number, idPerson: number, idFamilyRelationship: number, statePerson: number, createdAt: Date, observation: string) {
        this.idCasePerson = idCasePerson;
        this.idCase = idCase;
        this.idPerson = idPerson;
        this.idFamilyRelationship = idFamilyRelationship;
        this.statePerson = statePerson;
        this.createdAt = createdAt;
        this.observation = observation;
    }
}
