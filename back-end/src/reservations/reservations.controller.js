const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res, next) {
  const {date} = req.query;
  const reservationDate = new Date(date);
  const response = await service.list(reservationDate);

  res.json({
    data: response
  });
}

function validInput(req, res, next) {
  if (!req.body.data) {
    return next({status: 400, message: "Body must include a data object"});
  }

  const requiredInput = ["first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people"];

  for (let input of requiredInput) {
    if (!req.body.data.hasOwnProperty(input) || req.body.data === "") {
      return next({status: 400, message: `Field required: ${input}`});
    }
  }

  if (Number.isNaN(Date.parse(`${req.body.data.reservation_date} ${req.body.data.reservation_time}`))) {
    return next({status: 400, message: "reservation_date or reservation_time field is in an incorrect format"});
  }

  if (typeof req.body.data.people !== "number") {
    return next({status: 400, message: "people field must be a number"});
  }

  if (req.body.data.people < 1) {
    return next({status: 400, message: "people field must be at least 1"});
  }

  next();
}

async function create(req, res, next) {
  req.body.data.status = "booked";
  const response = await service.create(req.body.data);

  res.status(201).json({data: response[0]});
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [validInput, asyncErrorBoundary(create)],
};
