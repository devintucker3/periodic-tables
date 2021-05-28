import React, {useState} from "react";
import Reservations from "../dashboard/Reservations";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";

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
                <p>No reservations found</p>;
    }

    return (
        <div>
            <form>
                <ErrorAlert error={error} />

                <label htmlFor="mobile_number">Enter a customer's phone number:</label>

                <input name="mobile_number" id="mobile_number" type="text" onChange={changeHandler} value={mobileNumber} required />

                <button type="submit" onClick={submitHandler}>Find</button>
            </form>

            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Mobile Number</th>
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