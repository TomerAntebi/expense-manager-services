/*
 C:
 Validate that a userid exists by calling the Users service (separate process).
 Requirement: adding a cost item must verify that the user exists.
*/
exports.validateUserExists = async (userid) => {
  if (!userid) {
    return false;
  }

  // ++c Base URL must be provided via .env
  const baseUrl = process.env.USER_SERVICE_URL;
  if (!baseUrl) {
    const err = new Error("USER_SERVICE_URL is not configured");
    err.statusCode = 500;
    throw err;
  }

  let response;
  try {
    // ++c Ask Users service for the specific user
    response = await fetch(`${baseUrl}${userid}`);
  } catch (e) {
    // ++c Users service is unreachable -> 500 (not a fake 404)
    const err = new Error("User service is unreachable");
    err.statusCode = 500;
    throw err;
  }

  if (response.ok) {
    return true;
  }

  if (response.status === 404) {
    // ++c Real “user not found”
    return false;
  }

  // ++c Unexpected response from Users service
  const err = new Error("User service returned an unexpected response");
  err.statusCode = 500;
  throw err;
};
