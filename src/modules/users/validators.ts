const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  return emailRegex.test(email);
};

export const isValidPassword = (password: unknown): boolean => {
  if (typeof password !== "string") return false;
  return password.length >= 8;
};
