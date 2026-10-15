import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDirectory = resolve(projectRoot, "Backend");
const previewMode = process.argv.includes("--preview");
const npmArguments = process.env.npm_execpath
  ? [process.execPath, process.env.npm_execpath]
  : null;

let stopping = false;
const children = [];

function startNpm(args, cwd, label) {
  const command = npmArguments ? npmArguments[0] : process.platform === "win32" ? "npm.cmd" : "npm";
  const commandArgs = npmArguments ? [...npmArguments.slice(1), ...args] : args;
  const child = spawn(command, commandArgs, {
    cwd,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
    shell: !npmArguments && process.platform === "win32",
  });
  children.push(child);

  child.on("error", (error) => {
    console.error(`Could not start ${label}:`, error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  process.exitCode = exitCode;
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));

startNpm(["run", "dev"], backendDirectory, "CarRent backend");
startNpm(
  ["--prefix", "frontend", "run", previewMode ? "preview" : "dev", "--", "--host"],
  projectRoot,
  "CarRent frontend",
);
