import React from "react";
import { updateReservation, tableFinished } from "../utils/api";

function Tables({ table, reloadDashboard }) {
    if (!table) return null;

    function finishHandler() {
        if (window.confirm("Is this table rady to seat new guests? This cannot be undone.")) {
            const abortController = new AbortController();
            const reservation_id = table.reservation_id;

            tableFinished(table.table_id, abortController.signal)
                .then(() => updateReservation(reservation_id, "finished", abortController.signal))
                .then(reloadDashboard);

            return () => abortController.abort();
        }
    }

    return (
        <tr>
            <th scope="row">{table.table_id}</th>

            <td>{table.table_name}</td>
            <td>{table.capacity}</td>
            <td data-table-id-status={table.table_id}>{table.status}</td>
            <td>{table.reservation_id ? table.reservation_id : "--"}</td>

            {table.status === "occupied" && 
                <td data-table-id-finish={table.table_id}>
                    <button type="button" onClick={finishHandler}>Finish</button>
                </td>
            }
        </tr>
    );
}

export default Tables;