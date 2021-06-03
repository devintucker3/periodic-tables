const knex = require("../db/connection");

function list(date) {
    return knex("reservations")
        .select("*")
        .andWhere("reservation_date", date)
        .whereNot("status", "finished")
        .whereNot("status", "cancelled")
        .orderBy("reservation_time", "asc");
}

function create(reservation) {
    return knex("reservations")
        .insert(reservation)
        .returning("*");
}

function read(reservation_id) {
    return knex("reservations")
        .select("*")
        .where("reservation_id", reservation_id)
        .first();
}

function update(reservation) {
    return knex("reservations")
        .select("*")
        .where({reservation_id: reservation.reservation_id})
        .update(reservation, "*");
}

function updateStatus(reservation_id, status) {
    return knex("reservations")
        .where({reservation_id: reservation_id})
        .update("status", status)
        .returning("*")
        .then(created => created[0]);
}

function search(mobile_number) {
    return knex("reservations")
        .whereRaw("translate(mobile_number, '() -', '') like ?", `%${mobile_number.replace(/\D/g, "")}%`)
        .orderBy("reservation_date");
}

module.exports = {list, create, read, update, updateStatus, search}