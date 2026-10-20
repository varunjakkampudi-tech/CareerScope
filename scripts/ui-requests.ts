/** A read left behind by an unmounted saved-job view cannot settle a new view. */
export function staleSavedRead(
  method: string,
  pathname: string,
  startedEpoch: number,
  currentEpoch: number,
): boolean {
  return (
    method === 'GET' &&
    (pathname === '/api/leads' || /^\/api\/leads\/[^/]+\/history$/.test(pathname)) &&
    startedEpoch !== currentEpoch
  );
}
