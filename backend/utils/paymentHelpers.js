// Payment utility functions
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
};

const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MP${timestamp}${random}`;
};

const validatePhoneNumber = (phone) => {
  const kenyanPhoneRegex = /^254[17]\d{8}$/;
  return kenyanPhoneRegex.test(phone.replace(/\s+/g, ''));
};

const formatPhoneNumber = (phone) => {
  // Convert various formats to 254XXXXXXXXX
  let cleaned = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

const simulatePaymentDelay = () => {
  // Random delay between 1-3 seconds for more realistic simulation
  return Math.floor(Math.random() * 2000) + 1000;
};

module.exports = {
  generateTransactionId,
  generateReceiptNumber,
  validatePhoneNumber,
  formatPhoneNumber,
  simulatePaymentDelay
};