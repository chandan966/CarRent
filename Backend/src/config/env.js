import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function parseEnvFile(contents) {
  const values = {};

  for (const sourceLine of contents.split(/\r?\n/)) {
    let line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      const quote = value[0];
      value = value.slice(1, -1);
      if (quote === '"') {
        value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    values[match[1]] = value;
  }

  return values;
}

export async function loadBackendEnv() {
  process.env.NODE_ENV ||= "development";

  // Production hosts provide secrets through their private environment settings.
  if (process.env.NODE_ENV === "production") return;

  let contents;
  try {
    contents = await readFile(resolve(backendRoot, ".env.local"), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  // The project-local file intentionally wins in development. This avoids an
  // old PowerShell DATABASE_URL silently overriding the credentials in it.
  Object.assign(process.env, parseEnvFile(contents));
}
