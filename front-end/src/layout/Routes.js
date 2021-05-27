import React, {useState, useEffect} from "react";
import {listReservations} from "../utils/api";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../reservations/NewReservation";
import useQuery from "../utils/useQuery";
import NewTable from "../tables/NewTable";
import SeatAtTable from "../reservations/SeatAtTable";
import Search from "../search/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get("date");

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableError, setTableError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null);
    
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  }
  
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/reservations/new">
        <NewReservation />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatAtTable reservations={reservations} tables={tables} />
      </Route>
      <Route path="/tables/new">
        <NewTable />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          date={date ? date : today()}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tableError={tableError}  
        />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
