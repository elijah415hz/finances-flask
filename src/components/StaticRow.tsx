import React from 'react'
import type {TableDataEntry} from '../interfaces/Interfaces'

export default function StaticRow(props:
    {
        entry: TableDataEntry,
        i: number,
        fields: { name: string }[],
    }) {

    return (
        <tbody>
            <tr>
                {props.fields
                    .filter(column => !column.name.includes("id"))
                    .map(column => {
                        return (
                            <td key={props.i + column.name}>
                                {column.name === 'Amount' ? <span>$</span> : null}
                                <span
                                    className="tableInput"
                                >{props.entry[column.name as keyof TableDataEntry] || ""}
                                </span>

                            </td>
                        )
                    })}
            </tr>
        </tbody>
    )
}