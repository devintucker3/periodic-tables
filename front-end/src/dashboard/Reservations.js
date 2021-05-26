import React from "react";

function Reservations({ reservations }) {
    if (!reservations) return null;

    return (
        <tr>
            <th scope="row">{reservations.reservation_id}</th>

            <td>{reservations.first_name}</td>
            <td>{reservations.last_name}</td>
            <td>{reservations.mobile_number}</td>
            <td>{reservations.reservation_time}</td>
            <td>{reservations.people}</td>
            <td>{reservations.status}</td>
            <td>
                <a href={`/reservations/${reservations.reservation_id}/seat`}>
                    <button type="button">Seat</button>
                </a>
            </td>
        </tr>
    )
}

export default Reservations;