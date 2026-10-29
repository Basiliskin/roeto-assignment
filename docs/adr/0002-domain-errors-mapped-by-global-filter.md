# Domain errors mapped to HTTP by a global filter

The domain (`Game`, `User`) must stay free of framework imports, yet the API must answer 400/403/409 precisely. Domain code throws its own `DomainError` subclasses (`NotYourTurnError`, `NotAPlayerError`, `GameNotInProgressError`, `InvalidWinningScoreError`, `SelfPlayError`); one global `DomainExceptionFilter` maps each class to a status and the shared `ApiErrorDto` shape. Adding a rule = adding an error class + one map entry.

Considered: throwing Nest `HttpException`s from services (rejected: leaks HTTP into the domain/application layer and scatters status decisions).
