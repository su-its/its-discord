export async function killSelf(pid?: number): Promise<boolean> {
  if (!pid) {
    process.exit(0);
  }

  if (pid === process.pid) {
    process.exit(0);
  }

  return false;
}
