export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+(@[^\s@]+\.iiit\.ac\.in|@iiit\.ac\.in)$/;
  return regex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(password);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const regex = /^[6-9]\d{9}$/; // Indian phone numbers
  return regex.test(phone);
};
