# Username-only authentication with real JWT guard

The assignment requires an authenticated API, but within a ~2h budget passwords add hashing, a register flow and a form without exercising any game rule. We authenticate by username alone (`POST /auth/login` creates the User if missing and returns a JWT), and every game endpoint sits behind a JWT guard that also enforces Turn ownership. Adding passwords later is confined to the auth module.

Considered: username + bcrypt password (rejected: time cost, no domain value), seeded fixed users (rejected: can't demo arbitrary players).
