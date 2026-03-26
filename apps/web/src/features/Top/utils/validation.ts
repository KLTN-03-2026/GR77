export const validatePasswordsMatch = (password: string, confirm: string): string | null => {
  if (password !== confirm) {
    return "Passwords do not match.";
  }
  return null;
};
