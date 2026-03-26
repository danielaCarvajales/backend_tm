import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PersonRole } from '../person-role/person-role';

@Entity('customer_profiles', { schema: 'public' })
@Unique(['idPersonRole'])
export class CustomerProfile {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_customer_profile' })
  public idCustomerProfile: number;

  @Column({ type: 'integer', name: 'id_person_role', nullable: false })
  public idPersonRole: number;

  @Column({ type: 'varchar', name: 'code_customer', length: 250, nullable: false, unique: true })
  public codeCustomer: string;

  @Column({ type: 'datetime', name: 'created_at', nullable: false })
  public createdAt: Date;

  @ManyToOne(() => PersonRole, (personRole) => personRole.customerProfiles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'id_person_role' }])
  public personRole?: PersonRole;

  constructor(
    idCustomerProfile: number,
    idPersonRole: number,
    codeCustomer: string,
    createdAt: Date,
  ) {
    this.idCustomerProfile = idCustomerProfile;
    this.idPersonRole = idPersonRole;
    this.codeCustomer = codeCustomer;
    this.createdAt = createdAt;
  }
}
