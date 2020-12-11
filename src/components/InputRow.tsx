import React, { useState, useEffect } from 'react'
import { dataListStateType, tableDataEntry, allDataListsType } from '../interfaces/Interfaces'
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import { IconButton, TableCell, TableRow } from '@material-ui/core'
import { withStyles, makeStyles, createStyles, Theme } from '@material-ui/core/styles';


const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
      padding: 0,
      maxWidth: '10ch',
    },
  }),
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      '& input': {
          backgroundColor: 'inherit',
          paddingLeft: 0,
      }
    },
  }),
)(TableRow);

export default function InputRow(props:
    {
        entry: tableDataEntry,
        i: number,
        fields: { name: string }[],
        dataLists?: allDataListsType
        handleChange: Function,
        handleUpdate: Function,
        deleteEntry: Function
    }) {

    const [state, setState] = useState<tableDataEntry>({ Amount: "" })

    function makeDataList(propsState: dataListStateType[], id: string) {
        return (
            <datalist id={id}>
                {propsState.map((entry: dataListStateType) => {
                    return (
                        <option
                            value={entry.name}
                            key={entry.id}
                        />
                    )
                })}
            </datalist>
        )
    }

    function handleInputRowChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { name, value } = event.target;
        setState({ ...state, [name]: value })
    }

    useEffect(() => {
        setState(props.entry)
    }, [props.entry])

    return (
        <StyledTableRow>
            {props.fields
                .filter(column => !column.name.includes("id"))
                .map(column => {
                    return (
                        <StyledTableCell 
                            
                        >
                            {column.name === 'Amount' ? <span>$</span> : null}
                            <input
                                name={column.name}
                                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    props.handleChange(e, props.i)
                                }}
                                onChange={handleInputRowChange}
                                className="tableInput"
                                value={state[column.name as keyof tableDataEntry] || ""}
                                list={column.name}
                                style={{width: '80%'}}
                                // style={{width: `${(state[column.name as keyof tableDataEntry]?.toString().length || 12) + 3.5}ch`}}
                            />
                            {column.name === 'Source' && props.dataLists?.source ? (
                                makeDataList(props.dataLists?.source, column.name)
                            ) : null}
                            {column.name === 'Person' && props.dataLists?.person_earner ? (
                                makeDataList(props.dataLists?.person_earner, column.name)
                            ) : null}
                            {column.name === 'Narrow_category' && props.dataLists?.narrow_category ? (
                                makeDataList(props.dataLists?.narrow_category, column.name)
                            ) : null}
                            {column.name === 'Broad_category' && props.dataLists?.broad_category ? (
                                makeDataList(props.dataLists?.broad_category, column.name)
                            ) : null}
                            {column.name === 'Vendor' && props.dataLists?.vendor ? (
                                makeDataList(props.dataLists?.vendor, column.name)
                            ) : null}
                        </StyledTableCell>
                    )
                })}
            <StyledTableCell>
                <IconButton
                    color="primary"
                    onClick={() => props.handleUpdate(props.i)}
                >
                    <SaveIcon />
                </IconButton>
            </StyledTableCell>
            <StyledTableCell>
                <IconButton
                    aria-label="delete"
                    color="secondary"
                    onClick={() => props.deleteEntry(state.entry_id || state.id)}
                >
                    <DeleteIcon />
                </IconButton>
            </StyledTableCell>
        </StyledTableRow>
    )
}