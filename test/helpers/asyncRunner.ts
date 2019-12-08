/**
 * A small utility function which returns promise
 * that resolves with the execution of all the async functions.
 */
export default function(...fns: ((...args: any[]) => Promise<any>)[]) {
  const promises = []
  for (const fn of fns)
    promises.push(fn())
  return Promise.all(promises)
}
