export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier?: string | number) {
    super(`${entityName} ${identifier ? `con id/criterio '${identifier}' ` : ''}no encontrado(a)`);
  }
}

export class BusinessRuleValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidStateTransitionException extends DomainException {
  constructor(fromState: string, toState: string, reason?: string) {
    super(
      `Transición de estado inválida: de '${fromState}' a '${toState}'.${reason ? ` Motivo: ${reason}` : ''}`,
    );
  }
}

export class UnauthorizedActionException extends DomainException {
  constructor(message = 'No está autorizado para ejecutar esta acción') {
    super(message);
  }
}

export class ConcurrencyConflictException extends DomainException {
  constructor(message = 'Conflicto de concurrencia al procesar el recurso') {
    super(message);
  }
}
