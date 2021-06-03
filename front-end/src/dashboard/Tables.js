import React from "react";
import { tableFinished } from "../utils/api";

function Tables({ table, setTables, reloadDashboard }) {

    if (!table) return null;

    function finishHandler() {
        if (window.confirm("Is this table ready to seat new guests? This cannot be undone.")) {
            const abortController = new AbortController();

            tableFinished(table.table_id, abortController.signal)
                .then(reloadDashboard)
                .catch(error => console.log(error));
        }
    }

    return (
        <tr>
            <th scope="row">{table.table_id}</th>

            <td>{table.table_name}</td>
            <td>{table.capacity}</td>
            <td data-table-id-status={table.table_id}>{table.reservation_id ? "occupied" : "free"}</td>
            <td>{table.reservation_id ? table.reservation_id : ""}</td>

            {table.reservation_id ? (
                <td>
                    <button type="button" data-table-id-finish={table.table_id} onClick={finishHandler}>Finish</button>
                </td>
            ) : null}
        </tr>
    );
}

export default Tables;