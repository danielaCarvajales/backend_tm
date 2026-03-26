import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "../person/person";
import { Document } from "../document/document";

@Entity('people_documents', { schema: 'public' })
export class PersonDocuments {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_person_documents" })
    public idPersonDocuments: number;

    @Column({ type: "integer", name: "id_person", nullable: false })
    public idPerson: number;

    @Column({ type: "integer", name: "id_document", nullable: false })
    public idDocument: number;

    @ManyToOne(() => Person, (person) => person.personDocuments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_person" }])
    public person?: Person;

    @ManyToOne(() => Document, (document) => document.personDocuments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_document" }])
    public document?: Document;

    constructor(idPersonDocuments: number, idPerson: number, idDocument: number) {
        this.idPersonDocuments = idPersonDocuments;
        this.idPerson = idPerson;
        this.idDocument = idDocument;
    }
}
