import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CasePerson } from "../case-person/case-person";

@Entity('family_relationship', { schema: 'public' })
export class FamilyRelationship {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_family_relationship" })
    public idFamilyRelationship: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public nameFamilyRelationship: string;

    @OneToMany(() => CasePerson, (casePerson) => casePerson.familyRelationship)
    public casePersons?: CasePerson[];

    constructor(idFamilyRelationship: number, nameFamilyRelationship: string) {
        this.idFamilyRelationship = idFamilyRelationship;
        this.nameFamilyRelationship = nameFamilyRelationship;
    }
}
