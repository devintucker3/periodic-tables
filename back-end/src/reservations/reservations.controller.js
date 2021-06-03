const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    let data = await service.list(date);
    return res.json({ data: [...data] });
  }
  
  if (mobile_number) {
    let data = await service.search(mobile_number);
    return res.json({ data: [...data] });
  }
}

async function read(req, res) {
  res.json({ data: res.locals.reservation });
}

async function checkReservationId(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);
  if (!data)
    return next({
      status: 404,
      message: `Reservation ID: ${reservation_id} Not Found`,
    });
  else {
    res.locals.reservation = data;
    next();
  }
}

async function validProps(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: "Inputs missing" });
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data;

  if (
    !first_name ||
    !last_name ||
    !mobile_number ||
    !reservation_date ||
    !reservation_time ||
    !people
  ) {
    return next({
      status: 400,
      message:
        "first_name, last_name, mobile_number, reservation_date, reservation_time, and people fields must be completed",
    });
  }
  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/)) {
    return next({
      status: 400,
      message: "Invalid reservation_date entered",
    });
  }
  if (!reservation_time.match(/\d{2}:\d{2}/)) {
    return next({
      status: 400,
      message: "Invalid reservation_time entered",
    });
  }
  if (typeof people !== "number") {
    return next({
      status: 400,
      message: "Valid number needed for people",
    });
  }

  res.locals.newReserve = {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  };
  next();
}

async function validDate(req, res, next) {
  const { reservation_date } = req.body.data;
  let today = new Date();
  const resDate = new Date(reservation_date).toUTCString();
  if (resDate.includes("Tue")) {
    return next({
      status: 400,
      message: "Sorry, we are closed on Tuesdays. Please choose another day.",
    });
  }
  if (reservation_date.slice(0, 4) < today.getFullYear()) {
    return next({
      status: 400,
      message: "Please choose a future date.",
    });
  }
  next();
}

async function validTime(req, res, next) {
  const time = res.locals.newReserve.reservation_time;
  let hour = time[0] + time[1];
  let minutes = time[3] + time[4];
  hour = Number(hour);
  minutes = Number(minutes);
  if (hour < 10 || (hour <= 10 && minutes < 30))
    return next({ status: 400, message: "We're not open yet" });
  if (hour > 21 || (hour >= 21 && minutes > 30))
    return next({
      status: 400,
      message: "Too close to closing time or closed!",
    });
  next();
}

async function create(req, res, next) {
  const currentStatus = res.locals.newReserve.status;
  const { status } = req.body.data;
  if (status === "seated" || status === "finished") {
    return next({
      status: 400,
      message: "Reservation must be booked before seated or finished",
    });
  }

  const data = await service.create(res.locals.newReserve);
  res.status(201).json({ data: data[0] });
  next();
}

async function update(req, res) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const data = await service.update(updatedReservation);
  res.json({ data: data[0] });
}

async function validStatus(req, res, next) {
  const currentStatus = res.locals.reservation.status;
  const { status } = req.body.data;
  if (currentStatus === "finished") {
    return next({
      status: 400,
      message: "A finished reservation cannot be updated",
    });
  }

  if (status === "cancelled") {
    return next();
  }

  if (status !== "booked" && status !== "seated" && status !== "finished") {
    return next({
      status: 400,
      message: "status is unknown",
    });
  }
  next();
}

async function updateStatus(req, res) {
  const { reservation_id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_id, status);
  res.status(200).json({ data: { status:  data.status} });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(checkReservationId), asyncErrorBoundary(read)],
  create: [
    asyncErrorBoundary(validProps),
    asyncErrorBoundary(validDate),
    asyncErrorBoundary(validTime),
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(checkReservationId),
    asyncErrorBoundary(validProps),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(checkReservationId),
    asyncErrorBoundary(validStatus),
    asyncErrorBoundary(updateStatus),
  ],
};
