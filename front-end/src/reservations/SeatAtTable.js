import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function SeatAtTable({ reservations, tables }) {
    const history = useHistory();
    const {reservation_id} = useParams();

    const [tableId, setTableId] = useState(0);
    const [errors, setErrors] = useState([]);

    if (!tables || !reservations) return null;

    function validTableAndReservation() {
        const errorFound = [];

        const tableFound = tables.find(table => table.table_id === tableId);
        const reservationFound = reservations.find(reservation => reservation.reservation_id === reservation_id);

        if (!tableFound) {
            errorFound.push("This table you selected does not exist.");
        } else if (!reservationFound) {
            errorFound.push("This reservation does not exist.")
        } else {
            if (tableFound.status === "occupied") {
                errorFound.push("The table you selected is currently occupied.");
            }

            if (tableFound.capacity < reservationFound.people) {
                errorFound.push(`The table you selected cannot seat ${reservationFound.people} people.`);
            }
        }

        setErrors(errorFound);

        return errorFound.length === 0;
    }

    function changeHandler({target}) {
        setTableId(target.value);
    }

    function submitHandler(event) {
        event.preventDefault();

        if (validTableAndReservation()) {
            history.push("/dashboard");
        }
    }

    const listOfTables = () => {
        return tables.map(table =>
            <option value={table.table_id}>{table.table_name} - {table.capacity}</option>
        );
    }

    const errorList = () => {
        return errors.map((error, index) => <ErrorAlert key={index} error={error} />)
    }

	return (
		<form>
			{errorList()}

			<label htmlFor="table_id">Choose table:</label>
			<select 
				name="table_id" 
				id="table_id"
				value={tableId}
				onChange={changeHandler}
			>
				{listOfTables()}
			</select>

			<button type="submit" onClick={submitHandler}>Submit</button>
			<button type="button" onClick={history.goBack}>Cancel</button>
		</form>
	);
}

export default SeatAtTable;