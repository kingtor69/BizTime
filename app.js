/** BizTime express application. */
// starter code Copyright Colt Steele and/or Rithm School and/or Springboard
// all other code (noted) by Tor Kingdon

const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

// router code added by Tor Kingdon
const cRoutes = require("./routes/companies");
const iRoutes = require("./routes/invoices");
const indRoutes = require("./routes/industries");
app.use("/companies", cRoutes);
app.use("/invoices", iRoutes);
app.use("/industries", indRoutes);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;