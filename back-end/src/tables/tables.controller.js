const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationService = require("../reservations/reservations.service");

async function list(req, res, next) {
    const response = await service.list();

    res.json({data: response});
}

async function validTableId(req, res, next) {
    const {table_id} = req.params;
    const table = await service.read(table_id);

    if (!table) {
        return next({status: 404, message: `Table ID: ${table_id} Not Found`})
    } else {
        res.locals.table = table;
    
        next();
    }

}

async function read(req, res, next) {
    const response = await service.read(res.locals.table);

    res.json({data: response});
}

async function validInput(req, res, next) {
    if (!req.body.data) {
        return next({status: 400, message: "Table info required."})
    }

    const {table_name, capacity, reservation_id} = req.body.data


    if (!table_name || table_name === "" || table_name.length === 1) {
        return next({status: 400, message: "Invalid table_name"});
    }

    if (!capacity || capacity === 0) {
        return next({status: 400, message: "Invalid capacity"});
    }

    if (typeof capacity !== "number") {
        return next({status: 400, message: "Capacity field must be a number"});
    }

    if (req.body.data.capacity < 1) {
        return next({status: 400, message: "Capacity field must be at least 1 character"});
    }

    res.locals.new = {table_name: table_name, capacity: capacity};

    if (reservation_id) {
        res.locals.new.reservation_id = reservation_id;
        res.locals.new.status = "occupied";
    }
    
    next();
}

async function create(req, res, next) {
    console.log(res.locals.new);
    const response = await service.create(res.locals.new);

    res.status(201).json({data: response});
}

async function validReservation(req, res, next) {
    if (!req.body.data) {
        return next({status: 400, message: "Data required"})
    }

    const {reservation_id} = req.body.data;

    if (!reservation_id) {
        return next({status: 400, message: "Missing reservation_id"})
    }

    const reservation = await reservationService.read(reservation_id);

    if (!reservation) {
        return next({status: 404, message: reservation_id.toString()});
    }

    if (reservation.status === "seated") {
        return next({status: 400, message: "Party already seated"});
    }

    res.locals.reservation = reservation;

    next();
}

async function validSeating(req, res, next) {
    const {table_id} = req.params;
    const table = await service.read(table_id);

    const reservation = res.locals.reservation;

    if (table.capacity < reservation.people) {
        return next({status: 400, message: `capacity: ${table.capacity}`});
    }

    if (table.status === "occupied") {
        return next({status: 400, message: `${table.table_name} is currently occupied.`});
    }


    next();
}

async function update(req, res, next) {
    const {table_id} = req.params;
    const reservation_id = res.locals.reservation.reservation_id;

    const response = await service.update(table_id, reservation_id);

    await reservationService.updateStatus(reservation_id, "seated");

    res.status(200).json({data: response});
}

async function validOccupiedTable(req, res, next) {
    const table = await service.read(Number(req.params.table_id));
    
    if (!table) {
        return next({status: 404, message: `Table ${req.params.table_id} does not exist`});
    }

    if (!table.reservation_id) {
        return next({status: 400, message: "Table is not occupied"});
    }

    next();
}

async function destroy(req, res, next) {
    const table_id = Number(req.params.table_id);
    const table = await service.read(table_id);
    const response = await service.destroy(table_id);
    await reservationService.updateStatus(table.reservation_id, "finished");
    console.log(await reservationService.updateStatus(table.reservation_id, "finished"))
    res.status(200).json({data: response});
}

module.exports = {
    list: asyncErrorBoundary(list),
    read: [asyncErrorBoundary(validTableId), asyncErrorBoundary(read)],
    create: [asyncErrorBoundary(validInput), asyncErrorBoundary(create)],
    update: [asyncErrorBoundary(validReservation), asyncErrorBoundary(validSeating), asyncErrorBoundary(update)],
    destroy: [asyncErrorBoundary(validOccupiedTable), asyncErrorBoundary(destroy)],
}