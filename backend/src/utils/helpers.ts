export const generateOTP = (length: number = 6): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
};

export const generateError = (message: string, statusCode: number = 500) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  return error;
};
