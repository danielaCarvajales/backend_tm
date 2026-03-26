import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "../person/person";

@Entity("nacionalities", { schema: "public" })
export class Nacionality {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_nacionality" })
    public idNacionality: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public name: string;

    @Column({ type: "varchar", name: "abbreviation", length: 250, nullable: false })
    public abbreviation: string;

    @OneToMany(() => Person, (person) => person.nationality)
    public person?: Person[];

    constructor(name: string, abbreviation: string) {
        this.name = name;
        this.abbreviation = abbreviation;
    }
}
