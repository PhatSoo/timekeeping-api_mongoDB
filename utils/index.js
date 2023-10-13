const validateEmail = (email) => {
  return String(email).match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

const isFloat = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value)) {
    return true;
  }

  return false;
};

module.exports = {
  validateEmail,
  isFloat,
};
