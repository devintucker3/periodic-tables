import React from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import {previous, today, next} from "../utils/date-time";
import Reservations from "./Reservations";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, reservations, reservationsError, tables, tableError, reloadDashboard }) {
  const history = useHistory();

  function clickHandler({target}) {
    let newDate;
    let useDate;

    if (!date) {
      useDate = today();
    } else {
      useDate = date;
    }

    if (target.name === "previous") {
      newDate = previous(useDate);
    } else if (target.name === "next") {
      newDate = next(useDate);
    } else {
      newDate = today();
    }

    history.push(`/dashboard?date=${newDate}`);
  }

  const reservationList = () => {
    return reservations.map(reservation => <Reservations key={reservation.reservation_id} reservation={reservation} reloadDashboard={reloadDashboard}/>);
  };

  const tableList = () => {
    return tables.map(table => <Tables key={table.table_id} table={table} reloadDashboard={reloadDashboard} />);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />

      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Date</th>
            <th scope="col">Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col">Table</th>
            <th scope="col">Change Info</th>
            <th scope="col">Cancellation</th>
          </tr>
        </thead>

        <tbody>
          {reservationList()}
        </tbody>
      </table>

      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>

      <ErrorAlert error={tableError} />

      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Table Name</th>
            <th scope="col">Capacity</th>
            <th scope="col">Status</th>
            <th scope="col">Seated Party Id</th>
          </tr>
        </thead>

        <tbody>
          {tableList()}
        </tbody>
      </table>

      <button type="button" name="previous" onClick={clickHandler}>Previous</button>
      <button type="button" name="today" onClick={clickHandler}>Today</button>
      <button type="button" name="next" onClick={clickHandler}>Next</button>
      
    </main> 
  );
}

export default Dashboard;
