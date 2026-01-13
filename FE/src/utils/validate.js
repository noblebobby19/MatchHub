/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password, minLength = 6) {
  const errors = [];

  if (!password) {
    errors.push('Mật khẩu không được để trống');
    return { valid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
  if (!phone) return false;
  // Vietnamese phone: 10 digits starting with 0, or 11 digits starting with +84
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} { valid: boolean, error: string }
 */
export function validateRequired(value, fieldName = 'Trường này') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      valid: false,
      error: `${fieldName} không được để trống`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} { valid: boolean, error: string }
 */
export function validateNumberRange(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Giá trị phải là số',
    };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: `Giá trị phải nằm trong khoảng ${min} - ${max}`,
    };
  }

  return { valid: true, error: null };
}

