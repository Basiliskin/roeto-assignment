# Bot Turn decided on the server, replayed on the client

The Bot must look like a real opponent: thinking pauses, visible dice, step by step. The obvious way is to pace the Bot on the server (one step per request, or pushed over a socket), but that leaves the Game in a "Bot mid-turn" state that survives tab closes, needs many round-trips, and pushing is live sync, which is a Won't. Instead, the whole Bot Turn is played and saved inside the request that ends the human's Turn; the response carries the ordered `botSteps`, and the web app only *animates* them. The rules stay on the server and are deterministic under seeded dice. The cost: the UI must hold back the final state (for example the Bot's Win) until the replay ends, and the timing is purely cosmetic.

The Bot is a system User (`bot`) rather than a User-less Player, so "Player = a User's participation in a Game" and Win Count still hold; the one-active-Game rule (R8) is exempted for it.

Considered: client-driven step endpoint (rejected: partial-turn state, chatty), SSE/WebSocket push (rejected: live sync is out of scope), a frontend-only Bot (rejected: the client would choose moves for the opponent).
