import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  updateReservation,
  seatReservation,
  listReservations,
} from "../utils/api";

function SeatAtTable({ tables, reloadDashboard }) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [table_id, setTableId] = useState(0);
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    setReservationsError(null);

    listReservations(null, abortController.signal)
      .then((reservations) =>
        reservations.sort((a, b) =>
          a.reservation_time < b.reservation_time ? -1 : 1
        )
      )
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  }, []);

  if (!tables || !reservations) return null;

  function validTableAndReservation() {
    const errorFound = [];

    const tableFound = tables.find(
      (table) => table.table_id === Number(table_id)
    );
    const reservationFound = reservations.find(
      (reservation) => reservation.reservation_id === reservation_id
    );

    if (!tableFound) {
      errorFound.push("This table you selected does not exist.");
    }

    if (!reservationFound) {
      errorFound.push("This reservation does not exist.");
    }

    if (tableFound.status === "occupied") {
      errorFound.push("The table you selected is currently occupied.");
    }

    if (tableFound.capacity < reservationFound.people) {
      errorFound.push(
        `The table you selected cannot seat ${reservationFound.people} people.`
      );
    }

    setErrors(errorFound);

    return errorFound.length === 0;
  }

  function changeHandler({ target }) {
    setTableId(target.value);
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    if (validTableAndReservation()) {
      seatReservation(reservation_id, table_id, abortController.signal)
        .then(() =>
          updateReservation(reservation_id, "seated", abortController.signal)
        )
        .then(reloadDashboard)
        .then(() => history.push("/dashboard"))
        .catch(setApiError);
    }

    return () => abortController.abort();
  }

  const listOfTables = () => {
    return tables.map((table) => (
      <option key={table.table_id} value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    ));
  };

  const errorList = () => {
    return errors.map((error, index) => (
      <ErrorAlert key={index} error={error} />
    ));
  };

  return (
    <form>
      {errorList()}
      <ErrorAlert error={apiError} />
      <ErrorAlert error={reservationsError} />

      <label htmlFor="table_id">Choose table:</label>
      <select
        name="table_id"
        id="table_id"
        value={table_id}
        onChange={changeHandler}
      >
        <option value={0}>Choose a table</option>
        {listOfTables()}
      </select>

      <button type="submit" onClick={submitHandler}>
        Submit
      </button>
      <button type="button" onClick={history.goBack}>
        Cancel
      </button>
    </form>
  );
}

export default SeatAtTable;
