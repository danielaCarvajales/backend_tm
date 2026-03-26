import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CaseRecord } from "../case-record/case-record";

@Entity("states_cases", { schema: "public" })
export class StateCase {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_state" })
    public idState: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public nameState: string;

    @OneToMany(() => CaseRecord, (caseRecord) => caseRecord.stateCase)
    public casesRecords?: CaseRecord[];

    constructor(idState: number, nameState: string) {
        this.idState = idState;
        this.nameState = nameState;
    }
}

