import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {createTable} from "../utils/api";
import {today} from "../utils/date-time";

function NewTable({reloadDashboard}) {
    const history = useHistory();

    const [formData, setFormData] = useState({
        table_name: "",
        capacity: "",
    })
    const [error, setError] = useState(null);

    function validInput() {
        let errorFound = null;

        if (formData.table_name === "" || formData.capacity === "") {
            errorFound = {message: "Please fill out all fields."};
        } else if (formData.table_name.length < 2) {
            errorFound = {message: "Table name must be at least 2 characters."};
        }

        setError(errorFound);

        return errorFound === null;
    }

    function changeHandler({target}) {
        setFormData({...formData, [target.name]: target.name === "capacity" ? Number(target.value) : target.value});
    }

    function submitHandler(event) {
        event.preventDefault();
        const abortController = new AbortController();

        if (validInput()) {
            createTable(formData, abortController.signal)
                .then(() => history.push(`/dashboard?date=${today()}`))
                .then(reloadDashboard)
                .then(() => history.push("/dashboard"))
                .catch(setError)
        }

        return () => abortController.abort();
    }

    return (
        <form>
            <ErrorAlert error={error} />

            <label htmlFor="table_name">Table Name</label>
            <input name="table_name" id="table_name" type="text" minLength={2} onChange={changeHandler} value={formData.table_name} required />

            <label htmlFor="capacity">Capacity</label>
            <input name="capacity" id="capacity" type="number" min={1} onChange={changeHandler} value={formData.capacity} required />

            <button type="submit" onClick={submitHandler}>Submit</button>
            <button type="button" onClick={history.goBack}>Cancel</button>
        </form>
    )
}

export default NewTable;