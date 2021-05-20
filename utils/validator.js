// register validation
module.exports.validateRegister = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};

  // username validation
  if (username.trim() === "") {
    errors.username = "Username cannot be empty";
  }

  // email validation
  if (email.trim() === "") {
    errors.email = "Email cannot be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email is not a valid address";
    }
  }

  //password validation
  if (password === "") {
    errors.password = "Password cannot be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords does not match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

// login validation
module.exports.validateLogin = (username, password) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "Username cannot be empty";
  }

  if (password.trim() === "") {
    errors.password = "Password cannot be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
