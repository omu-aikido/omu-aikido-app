import { configure, getConsoleSink } from "@logtape/logtape"

await configure({
  sinks: { console: getConsoleSink() },
  loggers: [{ category: "record", lowestLevel: "debug", sinks: ["console"] }],
})
