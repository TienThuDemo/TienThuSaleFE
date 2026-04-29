export const invalidateIfSuccess = <T>(tags: T[]) => {
  return (_response: unknown, error: unknown) => {
    if (!error) {
      return tags;
    }
    return [];
  };
};
