export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventName: string;
}

export abstract class DomainEventBase implements DomainEvent {
  readonly occurredAt = new Date();

  abstract readonly eventName: string;
}
