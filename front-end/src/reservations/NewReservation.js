import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {createReservation, editReservation} from "../utils/api";

function NewReservation({ edit, reservations, reloadDashboard}) {
    const history = useHistory();
    const {reservation_id} = useParams();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
    });
    const [error, setError] = useState([]);
    const [apiError, setApiError] = useState(null);

    // For editing a reservation
    useEffect(() => {
        if (edit) {
            if (!reservations || !reservation_id) return null
    
            const reservationFound = reservations.find(reservation => reservation.reservation_id === Number(reservation_id));
    
            if (!reservationFound || reservationFound.status !== "booked") {
                return <p>Only booked reservations can be edited.</p>
            }

            const date = new Date(reservationFound.reservation_date);
            const dateToString = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getDate}`;
            console.log(dateToString);
    
            setFormData({
                first_name: reservationFound.first_name,
                last_name: reservationFound.last_name,
                mobile_number: reservationFound.mobile_number,
                reservation_date: dateToString,
                reservation_time: reservationFound.reservation_time,
                people: reservationFound.people,
            })
        }
    }, [edit, reservation_id, reservations])

    // validating if the date and time is not a day in the past, or on a Tuesday
    function validDate(errorFound) {
        const reserve = new Date(`${formData.reservation_date}T${formData.reservation_time}:00.000`);

        const today = new Date();

        if (reserve.getDay() === 2) {
            errorFound.push({message: "Reservations cannot be made on a Tuesday (Restaurant is closed)."});
        }

        if (reserve < today) {
            errorFound.push({message: "Reservations cannot be made in the past."});
        }

        if (reserve.getHours() < 10 || (reserve.getHours() === 10 && reserve.getMinutes() < 30)) {
            errorFound.push({message: "Reservation cannot be made: Restaurant is not open until 10:30AM."});
        } else if (reserve.getHours() > 22 || (reserve.getHours() === 22 && reserve.getMinutes() >= 30)) {
            errorFound.push({message: "Reservation cannot be made: Restaurant is closed after 10:30PM."});
        } else if (reserve.getHours() > 21 || (reserve.getHours() === 21 && reserve.getMinutes() > 30)) {
            errorFound.push({message: "Reservation cannot be made: Reservation must be made at least an hour before closing (10:30PM)."});
        }

        return errorFound.length === 0;
    }

    //validate given fields
    function validFields(errorFound) {
        for (let field in formData) {
            if (formData[field] === "") {
                errorFound.push({message: `${field.split("_").join(" ")} cannot be left blank.`})
            }
        }

        return errorFound.length === 0
    }
    
    function changeHandler({target}) {
        setFormData({...formData, [target.name]: target.name === "people" ? Number(target.value) : target.value});
    }
    
    function submitHandler(event) {
        event.preventDefault();
        const abortController = new AbortController();
        
        const errorFound = [];
        
        if (validDate(errorFound) && validFields(errorFound)) {
            if (edit) {
                editReservation(reservation_id, formData, abortController.signal)
                    .then(reloadDashboard)
                    .then(() => history.goBack())
                    .catch(setApiError);
            } else {
                createReservation(formData, abortController.signal)
                    .then(reloadDashboard)
                    .then(() => history.push(`/dashboard?date=${formData.reservation_date}`))
                    .catch(setApiError);
            }
        }

        setError(errorFound);

        return () => abortController.signal;
    }

    // iterating through errors to make a list
    const errorList = () => {
        return error.map((error, index) => <ErrorAlert key={index} error={error} />);
    }

    return (
        <form>
            {errorList()}
            <ErrorAlert error={apiError} />
            
            <label htmlFor="first_name">First Name</label>
            <input name="first_name" id="first_name" type="text" onChange={changeHandler} value={formData.first_name} required />

            <label htmlFor="last_name">Last Name</label>
            <input name="last_name" id="last_name" type="text" onChange={changeHandler} value={formData.last_name} required />

            <label htmlFor="mobile_number">Mobile Number</label>
            <input name="mobile_number" id="mobile_number" type="text" onChange={changeHandler} value={formData.mobile_number} required />

            <label htmlFor="reservation_date">Reservation Date</label>
            <input name="reservation_date" id="reservation_date" type="date" onChange={changeHandler} value={formData.reservation_date} required />

            <label htmlFor="reservation_time">Reservation Time</label>
            <input name="reservation_time" id="reservation_time" type="time" onChange={changeHandler} value={formData.reservation_time} required />

            <label htmlFor="people">People</label>
            <input name="people" id="people" type="number" min="1" onChange={changeHandler} value={formData.people} required />

            <button type="submit" onClick={submitHandler}>Submit</button>
            <button type="button" onClick={history.goBack}>Cancel</button>
        </form>
    );
}

export default NewReservation;