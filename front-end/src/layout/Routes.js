import React, { useState, useEffect } from "react";
import { listReservations, listTables } from "../utils/api";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateAndEditReservation from "../reservations/CreateAndEditReservation";
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
  const date = query.get("date") ? query.get("date") : today();

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableError, setTableError] = useState(null);
  

  useEffect(reloadDashboard, [date]);

  useEffect(() => {
    const abortController = new AbortController();

    listReservations({date}, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError)
  }, [tables, date]);

  function reloadDashboard() {
    const abortController = new AbortController();
    const abortControllerTwo = new AbortController();

    setReservationsError(null);
    setTableError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortControllerTwo.signal)
      .then(setTables)
      .catch(setTableError);

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
        <CreateAndEditReservation reloadDashboard={reloadDashboard} />
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <CreateAndEditReservation edit={true} reservations={reservations} reloadDashboard={reloadDashboard} />
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <SeatAtTable tables={tables} reloadDashboard={reloadDashboard} />
      </Route>

      <Route path="/tables/new">
        <NewTable reloadDashboard={reloadDashboard} />
      </Route>

      <Route path="/dashboard">
        <Dashboard
          date={date}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tableError={tableError}
          reloadDashboard={reloadDashboard}
          setTables={setTables}
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
