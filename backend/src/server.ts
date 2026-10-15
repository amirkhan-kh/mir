import { app } from "./app.js";
import { config } from "./core/config.js";
import { migrate } from "./core/migrate.js";
import { seed } from "./core/seed.js";

await migrate();
await seed();

app.listen(config.port, () => {
  console.log(`Mir API → http://localhost:${config.port}/api/v1`);
});
