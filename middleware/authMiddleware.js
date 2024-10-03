const protect = (req, res, next) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "unauthorized",
    });
  }

  req.user = user; // optional but provides user at root of request for rest of the routes

  next(); // this method sends to controller or next middleware in the stack
};

module.exports = protect;
