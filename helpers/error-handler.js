function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res
      .status(401)
      .json({ success: false, message: "The User is not Authorized" });
  }

  if (err.name === "ValidationError") {
    return res
      .status(401)
      .json({ success: false, message: "Validation Error" });
  }

  return res.status(500).send({ success: false, message: err });
}

module.exports = errorHandler;
