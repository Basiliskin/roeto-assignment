/** Base for business-rule violations. Mapped to HTTP status by the global filter (ADR 0002). */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
