import React, { useEffect, createRef } from "react";
import InputRow from "./InputRow";
import type {
  TableDataEntry,
  AllDataListsType,
} from "../interfaces/Interfaces";
import { ArrowDropDown, ArrowDropUp } from "@material-ui/icons";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import {
  makeStyles,
  createStyles,
  withStyles,
  Theme,
} from "@material-ui/core/styles";

export default function ReportTable(props: {
  state: {
    schema: {
      fields: { name: keyof TableDataEntry }[];
    };
    data: TableDataEntry[];
  };
  setState: Function;
  sortedBy: { column: keyof TableDataEntry; ascending: boolean };
  setSortedBy: Function;
  dataLists?: AllDataListsType;
  handleChange: Function;
  handleUpdate: Function;
  deleteEntry: Function;
  form?: string;
}) {
  const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
      head: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        padding: 10,
        fontSize: 16,
      },
    })
  )(TableCell);

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      table: {
        minWidth: 650,
      },
    })
  );
  const classes = useStyles();

  // Component scrolls into view on mount
  const myRef = createRef<HTMLTableElement>();
  const executeScroll = () => {
    if (myRef.current) {
      myRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper function for sortBy
  function arraysEqual(a: TableDataEntry[], b: TableDataEntry[]): boolean {
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Function to sort table by
  function sortBy(key: keyof TableDataEntry) {
    let entries = [...props.state.data];
    let sortedEntries = entries.sort((a, b) => (a[key]! >= b[key]! ? 1 : -1)); // "!" tells Typescript "I promise this won't be null or undefined"
    // If the array is already sorted ascending, sort it descending
    if (arraysEqual(sortedEntries, props.state.data)) {
      sortedEntries = entries.sort((a, b) => (a[key]! <= b[key]! ? 1 : -1));
      props.setSortedBy({ column: key, ascending: false });
    } else {
      props.setSortedBy({ column: key, ascending: true });
    }
    console.log(sortedEntries);
    props.setState({ ...props.state, data: sortedEntries });
  }

  useEffect(() => {
    executeScroll();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} ref={myRef}>
        <TableHead>
          <TableRow>
            {props.state.schema.fields
              .filter((column) => !column.name.includes("id"))
              .map((column) => {
                return (
                  <StyledTableCell
                    key={column.name}
                    onClick={() => sortBy(column.name)}
                    style={{ cursor: "pointer" }}
                  >
                    {column.name.replace("_", " ")} 
                    {props.sortedBy.column === column.name
                      ? props.sortedBy.ascending
                        ? <ArrowDropDown style={{marginBottom: "-7px"}}/>
                        : <ArrowDropUp style={{marginBottom: "-7px"}}/>
                      : null}
                  </StyledTableCell>
                );
              })}
            <StyledTableCell>
              <span>Save</span>
            </StyledTableCell>
            <StyledTableCell>
              <span>Delete</span>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody className="tableBody">
          {props.state.data.map((entry: TableDataEntry, i: number) => (
            <InputRow
              entry={entry}
              i={i}
              key={i}
              fields={props.state.schema.fields}
              handleChange={props.handleChange}
              handleUpdate={props.handleUpdate}
              dataLists={props.dataLists}
              deleteEntry={props.deleteEntry}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
