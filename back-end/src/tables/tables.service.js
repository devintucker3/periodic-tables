const knex = require("../db/connection");

function list() {
    return knex("tables")
        .select("*")
        .orderBy("table_name", "asc");
}

function create(table) {
    return knex("tables")
        .insert(table)
        .returning("*")
        .then(created => created[0]);
}

function read(table_id) {
    return knex("tables")
        .select("*")
        .where("table_id", table_id)
        .first();
}

function update(table_id, reservation_id) {
    return knex("tables")
        .where("table_id", table_id)
        .update({reservation_id: reservation_id, status: "occupied"})
        .returning("*");
}

function destroy(table_id) {
    return knex("tables")
        .where("table_id", table_id)
        .update({reservation_id: null, status: "free"})
        .returning("*");
}

module.exports = {list, create, read, update, destroy}