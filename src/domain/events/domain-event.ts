/**
 * Contrato mínimo para eventos de dominio (preparado para Domain Events / outbox).
 * Los agregados pueden publicar implementaciones concretas sin acoplarse a Nest ni HTTP.
 */
export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventName: string;
}

export abstract class DomainEventBase implements DomainEvent {
  readonly occurredAt = new Date();

  abstract readonly eventName: string;
}
