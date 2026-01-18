/*
 C:
 Users service must return the total costs for a specific user.
 To keep processes isolated, the Users service calls the Costs service over HTTP.
*/

exports.getTotalCostsForUser = async (userid) => {
  const baseUrl = process.env.COST_SERVICE_URL;
  if (!baseUrl) {
    const err = new Error("COST_SERVICE_URL is not configured");
    err.statusCode = 500;
    throw err;
  }

  // ++c Call Costs service total endpoint
  const url = `${baseUrl.replace(/\/$/, "")}/api/total/${userid}`;

  let response;
  try {
    response = await fetch(url);
  } catch (e) {
    // ++c Costs service unreachable -> 500
    const err = new Error("Failed to fetch total costs");
    err.statusCode = 500;
    throw err;
  }

  if (!response.ok) {
    // ++c Costs service returned an error -> 500
    const err = new Error("Failed to fetch total costs");
    err.statusCode = 500;
    throw err;
  }

  const payload = await response.json();
  return Number(payload.total) || 0;
};

