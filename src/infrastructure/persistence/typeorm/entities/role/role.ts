import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonRole } from "../person-role/person-role";

@Entity("role", { schema: "public" })
export class Role {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_role" })
    idRole: number;

    @Column({ type: "varchar", name: "name", nullable: false })
    name: string;

    @OneToMany(() => PersonRole, (personRole) => personRole.role)
    public personRole?: PersonRole[];

    constructor(idRole: number, name: string) {
        this.idRole = idRole;
        this.name = name;
    }
}
