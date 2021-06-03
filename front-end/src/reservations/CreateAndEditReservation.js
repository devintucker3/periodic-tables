import React, { useState, useEffect } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  createReservation,
  editReservation,
  readReservation,
} from "../utils/api";

function CreateAndEditReservation({ edit, reservations, reloadDashboard }) {
  const history = useHistory();
  const { reservation_id } = useParams();
  const { params, url } = useRouteMatch();
  const [type, setType] = useState("new");

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
  const [existingData, setExistingData] = useState({});

  // Updating state for editing
  useEffect(() => {
    console.log(edit, reservation_id, reservations);
    if (edit) {
      console.log("make it!!!!!%&*%^*!&%*");
      if (!reservations.length || !reservation_id) return null;

      const reservationFound = reservations.find(
        (reservation) => reservation.reservation_id === Number(reservation_id)
      );
      console.log(reservationFound);
      if (!reservationFound || reservationFound.status !== "booked") {
        return <p>Only booked reservations can be edited.</p>;
      }

      // const date = new Date(reservationFound.reservation_date);
      // const dateToString = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getDay()}`;
      // console.log(dateToString)
      setFormData({
        first_name: reservationFound.first_name,
        last_name: reservationFound.last_name,
        mobile_number: reservationFound.mobile_number,
        reservation_date: reservationFound.reservation_date,
        reservation_time: reservationFound.reservation_time,
        people: reservationFound.people,
      });
    }
  }, [edit, reservation_id, reservations]);

  useEffect(() => {
    Object.keys(params).length ? setType("edit") : setType("new");
  }, [history, params, url]);

  useEffect(() => {
    if (type === "edit") {
      const abortController = new AbortController();
      readReservation(params.reservation_id, abortController.signal)
        .then(setExistingData)
        .then(() => {
          console.log(existingData);
        })
        .catch(setError);
    } else {
      setExistingData({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 1,
      });
    }
  }, [type]);

  useEffect(() => {
    if (Object.keys(existingData).length) {
      setFormData({
        first_name: existingData.first_name,
        last_name: existingData.last_name,
        mobile_number: existingData.mobile_number,
        reservation_date: existingData.reservation_date,
        reservation_time: existingData.reservation_time,
        people: existingData.people,
      });
    }
  }, [existingData]);

  // validating if the date and time is not a day in the past, or on a Tuesday
  function validDate(errorFound) {
    const reserve = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00.000`
    );

    const today = new Date();

    if (reserve.getDay() === 2) {
      errorFound.push({
        message:
          "Reservations cannot be made on a Tuesday (Restaurant is closed).",
      });
    }

    if (reserve < today) {
      errorFound.push({ message: "Reservations cannot be made in the past." });
    }

    if (
      reserve.getHours() < 10 ||
      (reserve.getHours() === 10 && reserve.getMinutes() < 30)
    ) {
      errorFound.push({
        message:
          "Reservation cannot be made: Restaurant is not open until 10:30AM.",
      });
    } else if (
      reserve.getHours() > 22 ||
      (reserve.getHours() === 22 && reserve.getMinutes() >= 30)
    ) {
      errorFound.push({
        message:
          "Reservation cannot be made: Restaurant is closed after 10:30PM.",
      });
    } else if (
      reserve.getHours() > 21 ||
      (reserve.getHours() === 21 && reserve.getMinutes() > 30)
    ) {
      errorFound.push({
        message:
          "Reservation cannot be made: Reservation must be made at least an hour before closing (10:30PM).",
      });
    }

    return errorFound.length === 0;
  }

  //validate given fields
  function validFields(errorFound) {
    for (let field in formData) {
      if (formData[field] === "") {
        errorFound.push({
          message: `${field.split("_").join(" ")} cannot be left blank.`,
        });
      }
    }

    return errorFound.length === 0;
  }

  function changeHandler({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    const errorFound = [];

    if (validDate(errorFound) && validFields(errorFound)) {
      if (edit) {
        editReservation(reservation_id, formData, abortController.signal)
          .then(reloadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      } else {
        createReservation(formData, abortController.signal)
          .then(reloadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      }
    }

    setError(errorFound);

    return () => abortController.abort();
  }

  // iterating through errors to make a list
  const errorList = () => {
    return error.map((error, index) => (
      <ErrorAlert key={index} error={error} />
    ));
  };

  return (
    <form onSubmit={submitHandler}>
      {errorList()}
      <ErrorAlert error={apiError} />
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          name="first_name"
          className="ml-2 mt-2"
          id="first_name"
          type="text"
          onChange={changeHandler}
          value={formData.first_name}
          required
        />
      </div>

      <div>
        <label htmlFor="last_name">Last Name</label>
        <input
          name="last_name"
          className="ml-2"
          id="last_name"
          type="text"
          onChange={changeHandler}
          value={formData.last_name}
          required
        />
      </div>

      <div>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input
          name="mobile_number"
          className="ml-2"
          id="mobile_number"
          type="text"
          onChange={changeHandler}
          value={formData.mobile_number}
          required
        />
      </div>

      <div>
        <label htmlFor="reservation_date">Reservation Date</label>
        <input
          name="reservation_date"
          className="ml-2"
          id="reservation_date"
          type="date"
          onChange={changeHandler}
          value={formData.reservation_date}
          required
        />
      </div>

      <div>
        <label htmlFor="reservation_time">Reservation Time</label>
        <input
          name="reservation_time"
          className="ml-2"
          id="reservation_time"
          type="time"
          onChange={changeHandler}
          value={formData.reservation_time}
          required
        />
      </div>

      <div>
        <label htmlFor="people">People</label>
        <input
          name="people"
          className="ml-2"
          id="people"
          type="number"
          min="1"
          onChange={changeHandler}
          value={formData.people}
          required
        />
      </div>

      <div>
        <button type="submit" className="mr-2 mb-2 mt-2" onClick={submitHandler}>
          Submit
        </button>
        <button type="button" className="mr-2 mb-2 mt-2" onClick={history.goBack}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CreateAndEditReservation;
