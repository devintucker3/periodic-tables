import React from "react";

function Reservations({ reservations }) {
    if (!reservations || reservations.status === "finished") return null;

    return (
        <tr>
            <th scope="row">{reservations.reservation_id}</th>

            <td>{reservations.first_name}</td>
            <td>{reservations.last_name}</td>
            <td>{reservations.mobile_number}</td>
            <td>{reservations.reservation_time}</td>
            <td>{reservations.people}</td>
            <td>{reservations.status}</td>
            <td data-reservation-id-status={reservations.reservation_id}>{reservations.status}</td>
            
            {reservations.status === "booked" &&
                <td>
                    <a href={`/reservations/${reservations.reservation_id}/seat`}>
                        <button type="button">Seat</button>
                    </a>
                </td>
            }
        </tr>
    )
}

export default Reservations;