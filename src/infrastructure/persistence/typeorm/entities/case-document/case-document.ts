import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "../document/document";
import { CaseRecord } from "../case-record/case-record";

@Entity('case_documents', { schema: 'public' })
export class CaseDocument {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_case_documents" })
    public idCaseDocuments: number;

    @Column({ type: "integer", name: "id_case", nullable: false })
    public idCase: number;

    @Column({ type: "integer", name: "id_document", nullable: false })
    public idDocument: number;

    @ManyToOne(() => CaseRecord, (caseRecord) => caseRecord.caseDocuments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_case" }])
    public caseRecord?: CaseRecord;

    @ManyToOne(() => Document, (document) => document.caseDocuments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_document" }])
    public document?: Document;

    constructor(idCaseDocuments: number, idCase: number, idDocument: number) {
        this.idCaseDocuments = idCaseDocuments;
        this.idCase = idCase;
        this.idDocument = idDocument;
    }

}
