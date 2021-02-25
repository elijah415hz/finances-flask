import React, { useState, useEffect } from 'react';
import { Paper, Table, TableBody, TableContainer, TableCell, TableRow, TableHead } from '@material-ui/core';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import { TableDataEntry } from '../interfaces/Interfaces';
import { blueGrey } from '@material-ui/core/colors';

// import StaticRow from './StaticRow';

const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
        head: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            padding: 10,
            fontSize: 16
        },
        body: {
            padding: 10,
            fontSize: 14,
        },
    }),
)(TableCell);

const DarkTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: theme.palette.background.default,
            cursor: 'pointer'
        },
    }),
)(TableRow);

const LightTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: blueGrey[800],
        },
    }),
)(TableRow);

const ExtraLightTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: blueGrey[700],
        },
    }),
)(TableRow);

export default function PivotTable(props: {
    state:
    {
        schema:
        {
            fields: { name: string }[]
        },
        data: TableDataEntry[]

    },
}) {

    const [show, setShow] = useState<boolean[]>([false])

    function toggleShowRow(i: number) {
        let newShow = [...show]
        newShow[i] = !newShow[i]
        setShow(newShow)
    }

    const pivotState = props.state.data.reduce((a, b) => {
        if (b.Broad_category) {
            if (a[b.Broad_category]) {
                a[b.Broad_category].total += b.Amount;
            } else {
                a[b.Broad_category] = { total: b.Amount, narrow_categories: {} };
            }
            if (b.Narrow_category) {
                if (a[b.Broad_category].narrow_categories[b.Narrow_category]) {
                    a[b.Broad_category].narrow_categories[b.Narrow_category].total += b.Amount;
                } else {
                    a[b.Broad_category].narrow_categories[b.Narrow_category] = {total: b.Amount, persons: {}}   ;
                }
                if (b.Person) {
                    if (a[b.Broad_category].narrow_categories[b.Narrow_category].persons[b.Person]) {
                        a[b.Broad_category].narrow_categories[b.Narrow_category].persons[b.Person] += b.Amount;
                    } else {
                        a[b.Broad_category].narrow_categories[b.Narrow_category].persons[b.Person] = b.Amount;
                    }
                }
            } else if (b.Person) {
                if (a[b.Broad_category].narrow_categories["--"]?.persons[b.Person]) {
                    a[b.Broad_category].narrow_categories["--"].persons[b.Person] += b.Amount;
                    a[b.Broad_category].narrow_categories["--"].total += b.Amount;
                } else {
                a[b.Broad_category].narrow_categories = {...a[b.Broad_category].narrow_categories, "--": {persons: {[b.Person]: b.Amount}, total: b.Amount}}
                }
            }
        }
        return a
    }, {} as any)

    console.log(pivotState)

    useEffect(() => {
        let showState = Object.keys(pivotState).map((i: any) => false)
        setShow(showState)
    }, [props])
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>
                            Broad category
                        </StyledTableCell>
                        <StyledTableCell>
                            Narrow Category
                        </StyledTableCell>
                        <StyledTableCell>
                            Person
                        </StyledTableCell>
                        <StyledTableCell>
                            Amount
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(pivotState).map((bCat, i) => (
                        <>
                            <DarkTableRow key={i} onClick={() => toggleShowRow(i)}>
                                <StyledTableCell>
                                    {bCat}
                                    {show[i] ? <ExpandLess style={{marginBottom: "-7px"}}/> : <ExpandMore style={{marginBottom: "-7px"}}/>}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {/* Empty Cell */}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {/* Empty Cell */}
                                </StyledTableCell>
                                <StyledTableCell>
                                    ${pivotState[bCat].total.toFixed(2)}
                                </StyledTableCell>
                            </DarkTableRow>
                            {pivotState[bCat].narrow_categories && show[i] ? (
                                Object.keys(pivotState[bCat].narrow_categories).map(nCat => (
                                    <>
                                        <LightTableRow>
                                            <StyledTableCell>
                                                {/* Empty Cell */}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {nCat}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {/* Empty Cell */}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                ${pivotState[bCat].narrow_categories[nCat].total.toFixed(2)}
                                            </StyledTableCell>
                                        </LightTableRow>
                                        {pivotState[bCat].narrow_categories[nCat].persons ? (
                                            Object.keys(pivotState[bCat].narrow_categories[nCat].persons).map((person: string) => (
                                                <ExtraLightTableRow>
                                                    <StyledTableCell>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {person}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        ${pivotState[bCat].narrow_categories[nCat].persons[person].toFixed(2)}

                                                    </StyledTableCell>
                                                </ExtraLightTableRow>
                                            ))
                                            ) : null
                                        }
                                    </>
                                ))
                            ) : null}
                        </>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}