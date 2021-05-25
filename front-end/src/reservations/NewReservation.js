import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function NewReservation() {
    const history = useHistory();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        party_size: 0,
    });
    const [errors, setErrors] = useState([]);

    function validDate() {
        const reserve = new Date(formData.reservation_date);

        const today = new Date();
        const errorsFound = [];

        if (reserve < today) {
            errorsFound.push({message: "Reservations cannot be made in the past."});
        }

        
        if (reserve.getDay() === 2) {
            errorsFound.push({message: "Reservations cannot be made on a Tuesday (Restaurant is closed)."});
        }

        setErrors(errorsFound);

        if (errorsFound.length > 0) {
            return false
        }

        return true;
    }

    function changeHandler({target}) {
        setFormData({...formData, [target.name]: target.value});
    }

    function submitHandler(event) {
        event.preventDefault();

        if (validDate) {
            history.push(`/dashboard?date=${formData.reservation_date}`);
        }
    }

    const error = () => {
        return errors.map((error, index) => <ErrorAlert key={index} error={error} />);
    }

    return (
        <form>
            {error()}
            
            <label htmlFor="first_name">First Name</label>
            <input name="first_name" id="first_name" type="text" onChange={changeHandler} value={formData.first_name} required />

            <label htmlFor="last_name">Last Name</label>
            <input name="last_name" id="last_name" type="text" onChange={changeHandler} value={formData.last_name} required />

            <label htmlFor="mobile_number">Mobile Number</label>
            <input name="mobile_number" id="mobile_number" type="tel" onChange={changeHandler} value={formData.mobile_number} required />

            <label htmlFor="reservation_date">Reservation Date</label>
            <input name="reservation_date" id="reservation_date" type="date" onChange={changeHandler} value={formData.reservation_date} required />

            <label htmlFor="reservation_time">Reservation Time</label>
            <input name="reservation_time" id="reservation_time" type="time" onChange={changeHandler} value={formData.reservation_time} required />

            <label htmlFor="party_size">Party Size</label>
            <input name="party_size" id="party_size" type="number" min="1" onChange={changeHandler} value={formData.party_size} required />

            <button type="submit" onClick={submitHandler}>Submit</button>
            <button type="button" onClick={history.goBack}>Cancel</button>
        </form>
    );
}

export default NewReservation;