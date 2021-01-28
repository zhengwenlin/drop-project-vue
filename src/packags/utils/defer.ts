interface Defer {
  (): {
    resolve: () => void,
    rejecet: () => void,
    promise: Promise<void>
  },

  <T>(): {
    resolve: (val: T) => void,
    reeject: () => void,
    promise: Promise<T>
  }
}


export const defer: Defer = () => {
  const dfd = {} as any;
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reeject = reject;
  })

  return dfd;
} 