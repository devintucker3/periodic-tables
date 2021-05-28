const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
    const response = await service.list();

    res.json({data: response});
}

function validInput(req, res, next) {
    if (!req.body.data.table_name || req.body.data.table_name === "") {
        return next({status: 400, message: "Name field cannot be empty"});
    }

    if (req.body.data.table_name.length < 2) {
        return next({status: 400, message: "Name field must be at least 2 characters"});
    }

    if (!req.body.data.capacity || req.body.data.capacity === "") {
        return next({status: 400, message: "Capacity field cannot be empty"});
    }

    if (typeof req.body.data.capacity !== "number") {
        return next({status: 400, message: "Capacity field must be a number"});
    }

    if (req.body.data.capacity < 1) {
        return next({status: 400, message: "Capacity field must be at least 1 character"});
    }

    next();
}

async function create(req, res, next) {
    req.body.data.status = "free";

    const response = await service.create(req.body.data);

    res.status(201).json({data: response[0]});
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [validInput, asyncErrorBoundary(create)],
}