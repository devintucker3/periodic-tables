import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, readReservation, seatReservation } from "../utils/api";

function SeatAtTable({reloadDashboard}) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);

  const [formData, setFormData] = useState({
    table_name: "",
    capacity: null,
    table_id: null,
  });

  const notNull = (obj) => {
    for (let key in obj) {
      if (!obj[key]) return false;
    }

    return true;
  };

  function validSeating(formData, reservation, setError) {
    setError(null);

    if (!notNull(formData)) {
      setError(new Error("Must choose a table"));
      return false;
    }

    if (reservation.people > formData.capacity) {
      setError(
        new Error("Must choose a table with capacity greater than party size")
      );

      return false;
    }

    return true;
  }

  useEffect(() => {
    listTables()
      .then(setTables)
      .then(readReservation(reservation_id).then(setReservations));
  }, [reservation_id]);

  function changeHandler(event) {
    const value = event.target.value;
    const valueArr = value.split(",");
    const valueObj = {
      table_name: valueArr[0],
      capacity: valueArr[1],
      table_id: valueArr[2],
    };
    setFormData(valueObj);
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    if (validSeating(formData, reservations, setError)) {
      seatReservation(formData.table_id, reservation_id, abortController.signal)
        .then(reloadDashboard)
        .then(() => history.push("/dashboard"))
        .catch((error) => {
          setError(error);
        });
    }
  }

  const listOfTables = () => {
    return tables.map((table) => (
      <option key={table.table_id} value={[table.table_name, table.capacity, table.table_id]}>
        {table.table_name} - {table.capacity}
      </option>
    ));
  };

  return (
    <div>
      {error ? <ErrorAlert error={error} /> : null}
      <h2>Assign Table</h2>
      <form name="seat-reservation" onSubmit={submitHandler}>
        <label htmlFor="table_id">Choose table:</label>
        <select
          name="table_id"
          id="table_id"
          value={[formData.table_name, formData.capacity, formData.table_id]}
          onChange={changeHandler}
          required
        >
          <option value={[null, null]}>Choose a table</option>
          {listOfTables()}
        </select>

        <button type="submit">
          Submit
        </button>
        <button type="button" onClick={history.goBack}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatAtTable;
