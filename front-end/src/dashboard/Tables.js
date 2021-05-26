import React from "react";
import { useHistory } from "react-router-dom";

function Tables({ tables }) {
    const history = useHistory()
    if (!tables) return null;

    function finishHandler() {
        if (window.confirm("Is this table rady to seat new guests? This cannot be undone.")) {
            history.push("/dashboard");
        }
    }

    return (
        <tr>
            <th scope="row">{tables.table_id}</th>

            <td>{tables.table_name}</td>
            <td>{tables.capacity}</td>
            <td data-table-id-status={tables.table_id}>{tables.status}</td>

            {tables.status === "occupied" && 
                <td data-table-id-finish={tables.table_id}>
                    <button type="button" onClick={finishHandler}>Finish</button>
                </td>
            }
        </tr>
    );
}

export default Tables;