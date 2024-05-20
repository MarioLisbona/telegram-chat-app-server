export const asyncHandler =
  (fn) =>
  (...args) => {
    const fnReturn = fn(...args);
    return Promise.resolve(fnReturn).catch(args[args.length - 1]);
  };
