import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { State } from "../state/state";
import { Person } from "../person/person";
import { Company } from "../company/company";

@Entity("credentials", { schema: "public" })
@Unique(["idPerson", "codeCompany"])
export class Credentials {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_credential" })
    public id: number;

    @Column({ type: "varchar", name: "username", length: 250, nullable: false })
    public username: string;

    @Column({ type: "varchar", name: "password", length: 250, nullable: false })
    public password: string;

    @Column({ type: "integer", name: "state", nullable: false, default: 1 })
    public state: number;

    @Column({ type: "datetime", name: "last_access", nullable: false })
    public lastAccess: Date;

    @Column({ type: "integer", name: "id_person", nullable: false })
    public idPerson: number;

    @Column({ type: "integer", name: "code_company", nullable: false })
    public codeCompany: number;

    @Column({ type: "integer", name: "failed_attempts", nullable: false, default: 0 })
    public failedAttempts: number;

    @Column({ type: "timestamp", name: "account_locked_until", nullable: true })
    public accountLockedUntil: Date | null;

    @ManyToOne(() => State, (state) => state.credentials, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "state" }])
    public stateCredential?: State;

    @ManyToOne(() => Person, (person) => person.credentials, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_person" }])
    public person?: Person;

    @ManyToOne(() => Company, (company) => company.credentials, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "code_company" }])
    public company?: Company;

    constructor(
        id: number,
        username: string,
        password: string,
        state: number,
        lastAccess: Date,
        idPerson: number,
        codeCompany: number,
        failedAttempts: number,
        accountLockedUntil: Date | null,
    ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.state = state;
        this.lastAccess = lastAccess;
        this.idPerson = idPerson;
        this.codeCompany = codeCompany;
        this.failedAttempts = failedAttempts;
        this.accountLockedUntil = accountLockedUntil;
    }
}
