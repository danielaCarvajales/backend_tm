import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "../person/person";

@Entity("types_identification_documents", { schema: "public" })

export class IdentityDocumentTypes {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_type_identification_document" })
    public idTypeIdentificationDocument: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public name: string;

    @Column({ type: "varchar", name: "abbreviation", length: 50, nullable: false })
    public abbreviation: string;

    @OneToMany(() => Person, (person) => person.typeDocument)
    public person?: Person[];

    constructor(name: string, abbreviation: string) {
        this.name = name;
        this.abbreviation = abbreviation;
    }
}
