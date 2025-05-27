export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[^\s@]+\.iiit\.ac\.in$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};
