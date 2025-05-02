import * as os from "node:os";

export async function getProcessInfo(): Promise<{
  pid: number;
  hostname: string;
}> {
  return {
    pid: process.pid,
    hostname: os.hostname(),
  };
}
