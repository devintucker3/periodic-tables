import React, {useState} from "react";
import Reservations from "../dashboard/Reservations";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";
import "./Search.css"

function Search() {
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);

    function changeHandler({target}) {
        setMobileNumber(target.value);
    }

    function submitHandler(event) {
        event.preventDefault();

        const abortController = new AbortController();

        setError(null);

        listReservations({mobile_number: mobileNumber}, abortController.signal)
            .then(setReservations)
            .catch(setError);

        return () => abortController.abort();
    }

    const searchResults = () => {
        return reservations.length > 0 ? 
            reservations.map(reservation => <Reservations key={reservation.reservation_id} reservation={reservation} />) : 
                <tr> 
                    <td>No reservations found</td>
                </tr>
    }

    return (
        <div className="table-responsive">
            <form>
                <ErrorAlert error={error} />

                <label htmlFor="mobile_number" className="mr-2">Enter a customer's phone number:</label>

                <input className="mr-2 mb-2 mt-2" name="mobile_number" id="mobile_number" type="text" onChange={changeHandler} value={mobileNumber} required />

                <button className="mr-2 mb-2 mt-2" type="submit" onClick={submitHandler}>Find</button>
            </form>

            <table className="table table-sm overflow">
                <thead className="table-head">
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">First</th>
                        <th scope="col">Last</th>
                        <th scope="col">Number</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">People</th>
                        <th scope="col">Status</th>
                        <th scope="col">Edit</th>
                        <th scope="col">Cancel</th>
                        <th scope="col">Seat</th>
                    </tr>
                </thead>

                <tbody>
                        {searchResults()}
                </tbody>
            </table>
        </div>
    );
}

export default Search;