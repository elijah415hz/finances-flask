import React, { useState, useEffect } from 'react';
import ReportTable from '../components/Table';
import AddExpensesForm from '../components/AddExpensesForm'
import AddIncomeForm from '../components/AddIncomeForm'
import API from '../utils/API'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AuthContext } from '../App'
import type {
    TableDataEntry,
    DataListStateType,
    AllDataListsType,
    FormStateType,
    InputName
} from '../interfaces/Interfaces'
import {
    AppBar,
    Button,
    Container,
    Backdrop,
    CircularProgress,
    Dialog,
    Box,
    TextField
} from '@material-ui/core';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import AddIcon from '@material-ui/icons/Add'
import { emptyDatabase } from '../utils/db';
import PivotTable from '../components/PivotTable';
import Form from '../components/Form';

function Home() {
    const { Auth, setAuth, setAlertState } = React.useContext(AuthContext)

    // Form control state
    const [formState, setFormState] = useState<FormStateType>(
        {
            form: "expenses",
            year: new Date(Date.now()).getUTCFullYear(),
            month: new Date(Date.now()).getUTCMonth() + 1,
            search: ""
        }
    )

    const [incomeTableState, setIncomeTableState] = useState<{ schema: { fields: [] }, data: TableDataEntry[] }>(
        {
            schema: { fields: [] },
            data: [{
                Amount: "",
                Date: "",
                Source: "",
                Person: "",
                id: NaN,
                source_id: NaN,
                earner_id: NaN
            }]
        }
    )

    const [expensesTableState, setExpensesTableState] = useState<{ schema: { fields: [] }, data: TableDataEntry[] }>(
        {
            schema: { fields: [] },
            data: [{
                Amount: "",
                Date: "",
                Source: "",
                Vendor: "",
                Broad_category: "",
                Narrow_category: "",
                Person: "",
                Notes: "",
                entry_id: NaN
            }]
        }

    )

    const [searchTableState, setSearchTableState] = useState<{ schema: { fields: [] }, data: TableDataEntry[] }>(
        {
            schema: { fields: [] },
            data: [{
                Amount: "",
                Date: "",
                Source: "",
                Vendor: "",
                Broad_category: "",
                Narrow_category: "",
                Person: "",
                Notes: "",
                entry_id: NaN
            }]
        }

    )

    const [searchFormState, setSearchFormState] = useState<string>("")


    // State for datalists
    const [dataListsState, setDataListsState] = useState<AllDataListsType>({
        source: [],
        person_earner: [],
        narrow_category: [],
        broad_category: [],
        vendor: []
    })

    // Loading Backdrop display state
    const [openBackdrop, setOpenBackdrop] = useState(false);

    // Converts dates to human-readable format
    function formatDates(entry: TableDataEntry): TableDataEntry {
        if (!entry.Date) {
            return entry
        } else {
            let date = new Date(entry.Date);
            let year = date.getUTCFullYear();
            let month = (1 + date.getUTCMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            let day = date.getUTCDate().toString();
            day = day.length > 1 ? day : '0' + day;
            let dateString = month + '/' + day + '/' + year;
            entry.Date = dateString
            return entry
        }
    }

    // Form control
    function handleFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | React.ChangeEvent<HTMLSelectElement>): void {
        let name = event.target.name as keyof typeof formState
        setFormState({ ...formState, [name]: event.target.value })
    }

    async function handleFormSubmit(event: React.SyntheticEvent): Promise<any> {
        try {
            event.preventDefault()
            let route = formState.form
            setOpenBackdrop(true)
            let response = await API[route](Auth.token, formState)
            setOpenBackdrop(false)
            // Formatting the dates the hard way because javascript doesn't support strftime...
            if (route !== 'pivot') {
                response.data = response.data.map(formatDates)
            }
            switch (route) {
                case "expenses":
                    setExpensesTableState(response)
                    break;
                case "income":
                    setIncomeTableState(response)
                    break;
                case "pivot":
                    setExpensesTableState(response)
                    break;
                case "search":
                    setSearchTableState(response)
                    break;
            }
        } catch (err) {
            if (err.message === "Unauthorized") {
                setAuth({ type: 'LOGOUT' })
            }
            setOpenBackdrop(false)
            setAlertState({
                severity: "error",
                message: "Error Fetching Data",
                open: true
            })
        }
    }

    // Helper function for assigning an id to a TableDataEntry if user input matches an existing record
    function assignId(
        name: InputName,
        value: string) {

        let state;
        let id;

        switch (name) {
            case "Person":
                state = dataListsState.person_earner;
                id = 'person_id';
                break;
            case "Source":
                state = dataListsState.source;
                id = 'source_id';
                break;
            case "Broad_category":
                state = dataListsState.broad_category;
                id = 'broad_category_id';
                break;
            case "Narrow_category":
                state = dataListsState.narrow_category;
                id = 'narrow_category_id';
                break;
            case "Vendor":
                state = dataListsState.vendor;
                id = 'vendor_id';
                break;
        }
        let dataListItem = state.filter((i: DataListStateType) => i.name === value)[0]
        if (dataListItem) {
            return { id: id, dataListItem: dataListItem }
        } else {
            return { id: null, dataListItem: null }
        }
    }

    // Keep global state synced with InputRow state
    async function handleExpensesChange(event: React.ChangeEvent<HTMLInputElement>, index: number): Promise<void> {
        try {
            let { name, value } = event.target;
            let newExpensesTableStateData: TableDataEntry[] = [...expensesTableState.data]
            let updatedRow: TableDataEntry = { ...newExpensesTableStateData[index], [name]: value }
            if (name === "Person" || name === "Broad_category" || name === "Narrow_category" || name === "Vendor") {
                let { id, dataListItem } = assignId(name as InputName, value)
                if (id && dataListItem) {
                    updatedRow = { ...updatedRow, [id]: dataListItem.id }
                }
            }
            newExpensesTableStateData[index] = updatedRow
            setExpensesTableState({ ...expensesTableState, data: newExpensesTableStateData })

        } catch (err) {
            console.error(err)
            if (err.message === "Unauthorized") {
                setAuth({ type: 'LOGOUT' })
            }
        }
    }

    // Keep global state synced with InputRow state
    async function handleIncomeChange(event: React.ChangeEvent<HTMLInputElement>, index: number): Promise<void> {
        try {
            let { name, value } = event.target;
            let newIncomeTableStateData: TableDataEntry[] = [...incomeTableState.data]
            let updatedRow: TableDataEntry = { ...newIncomeTableStateData[index], [name]: value }
            if (name === "Person" || name === "Source") {
                let { id, dataListItem } = assignId(name as InputName, value)
                if (id && dataListItem) {
                    updatedRow = { ...updatedRow, [id]: dataListItem.id }
                }
            }
            newIncomeTableStateData[index] = updatedRow
            setIncomeTableState({ ...incomeTableState, data: newIncomeTableStateData })
        } catch (err) {
            console.error(err)
        }
    }

    // Update an row altered by the user
    async function updateExpensesRow(index: number): Promise<void> {
        try {
            await API.updateExpenses(Auth.token, expensesTableState.data[index])
            setAlertState({
                severity: "success",
                message: "Record updated!",
                open: true
            })
        } catch (err) {
            console.log(err)
            setAlertState({
                severity: "error",
                message: "Error: Failed to save!",
                open: true
            })
        }
    }

    // Update an row altered by the user
    async function updateIncomeRow(index: number): Promise<void> {
        try {
            await API.updateIncome(Auth.token, incomeTableState.data[index])
            setAlertState({
                severity: "success",
                message: "Record updated!",
                open: true
            })
        } catch (err) {
            setAlertState({
                severity: "error",
                message: "Error: Failed to save!",
                open: true
            })
        }
    }

    // Delete a row from the database
    async function deleteEntry(id: number | undefined) {
        try {
            if (formState.form === "expenses") {
                await API.deleteExpenses(Auth.token, id);
                let newExpensesTableStateData = expensesTableState.data.filter(entry => entry.entry_id !== id)
                setExpensesTableState({ ...expensesTableState, data: newExpensesTableStateData })
            } else if (formState.form === "income") {
                await API.deleteIncome(Auth.token, id);
                let newIncomeTableStateData = incomeTableState.data.filter(entry => entry.id !== id)
                setIncomeTableState({ ...incomeTableState, data: newIncomeTableStateData })
            }
        } catch (err) {
            console.error(err)
            if (err === 'Unauthorized') {
                setAuth({ type: 'LOGOUT' })
            }
        }
    }

    // Create classes to use for styling
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            formControl: {
                margin: theme.spacing(1),
                minWidth: '7em'
            },
            selectEmpty: {
                marginTop: theme.spacing(2),
            },
            root: {
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                [theme.breakpoints.up('md')]: {
                    flexWrap: 'noWrap',
                },
                '& > *': {
                    margin: theme.spacing(1),
                    [theme.breakpoints.down('xs')]: {
                        width: '100%',
                    },
                },
            },
            wallchart: {
                width: '100%'
            },
            logoutBtn: {
                float: 'right',
                margin: '1em',
            },
            downloadBtn: {
                float: 'left',
                margin: '1em',
            },
            backdrop: {
                zIndex: 1301, // To be in front of Dialog at 1300
                color: '#fff',
            },
            speedDial: {
                position: 'fixed',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
            },
            dialog: {
                width: '100%',
            },
            datePicker: {
                [theme.breakpoints.down('sm')]: {
                    marginLeft: '-10px'
                },
            }
        })
    );
    const classes = useStyles();

    // SpeedDial controls
    const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

    const actions = [
        { icon: <AddIcon />, name: 'Expenses', action: handleExpensesOpen, operation: 'product' },
        { icon: <AddIcon />, name: 'Income', action: handleIncomeOpen, operation: 'tag' }
    ]

    const handleSpeedDialClose = () => {
        setSpeedDialOpen(false);
    };

    const handleOpen = () => {
        setSpeedDialOpen(true);
    };

    function handleExpensesOpen(): void {
        setAddExpensesOpen(true)
        setSpeedDialOpen(false)
    }

    function handleIncomeOpen(): void {
        setAddIncomeOpen(true)
        setSpeedDialOpen(false)
    }

    // Controls for Dialogs
    const [addExpensesOpen, setAddExpensesOpen] = useState(false)
    const [addIncomeOpen, setAddIncomeOpen] = useState(false)
    function handleClose() {
        setAddExpensesOpen(false)
        setAddIncomeOpen(false)
    }

    useEffect(() => {
        async function getDataLists(): Promise<void> {
            let datalists = await API.dataList(Auth.token)
            setDataListsState(datalists)
        }
        getDataLists()
    }, [])

    // Move to own component once tested!
    function downloadFile(): void {
        API.downloadFile(Auth.token, `${Auth.user}_expenses.xlsx`, "2020-02-01", "2020-05-01")
    }



    return (
        <Box component='div' className="Home">
            <Box component='header' className="header">
                <Button
                    variant="contained"
                    color="secondary"
                    className={classes.downloadBtn}
                    onClick={downloadFile}
                >Download</Button>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.logoutBtn}
                    onClick={async () => {
                        setAuth({ type: 'LOGOUT' })
                        let res = await emptyDatabase()
                        console.log(res)
                    }}
                >Logout
                </Button>
                <Container className={classes.root}>
                    <h1 style={{ textAlign: 'center' }}>{Auth.user} Finances</h1>
                </Container>

                <img src="/wallchart" alt="Wall Chart" className={classes.wallchart} />

                <Form
                    classes={classes}
                    handleFormSubmit={handleFormSubmit}
                    handleFormChange={handleFormChange}
                    formState={formState}
                />
            </Box >
            <div className="body">
                {formState.form === "income" && incomeTableState.data[0]?.id ? (
                    <ReportTable
                        state={incomeTableState}
                        dataLists={dataListsState}
                        handleChange={handleIncomeChange}
                        handleUpdate={updateIncomeRow}
                        deleteEntry={deleteEntry}
                        form={formState.form}
                    />
                ) : null}
                {formState.form === "expenses" && expensesTableState.data[0]?.entry_id ? (
                    <ReportTable
                        state={expensesTableState}
                        dataLists={dataListsState}
                        handleChange={handleExpensesChange}
                        handleUpdate={updateExpensesRow}
                        deleteEntry={deleteEntry}
                        form={formState.form}
                    />
                ) : null}
                {formState.form === "search" && searchTableState.data[0]?.entry_id ? (
                    <ReportTable
                        state={searchTableState}
                        dataLists={dataListsState}
                        handleChange={handleExpensesChange}
                        handleUpdate={updateExpensesRow}
                        deleteEntry={deleteEntry}
                        form={formState.form}
                    />
                ) : null}
                {formState.form === "pivot" && expensesTableState.data[0]?.entry_id ? (
                    <PivotTable state={expensesTableState} />
                ) : null}
            </div>
            <Dialog onClose={handleClose} open={addExpensesOpen} maxWidth='xl'>
                <AddExpensesForm
                    classes={classes}
                    handleClose={handleClose}
                    setOpenBackdrop={setOpenBackdrop}
                />
            </Dialog>
            <Dialog onClose={handleClose} open={addIncomeOpen} maxWidth='xl'>
                <AddIncomeForm
                    classes={classes}
                    handleClose={handleClose}
                    setOpenBackdrop={setOpenBackdrop}
                />
            </Dialog>
            <SpeedDial
                ariaLabel="SpeedDial example"
                className={classes.speedDial}
                // hidden={hidden}
                icon={<SpeedDialIcon />}
                onClose={handleSpeedDialClose}
                onOpen={handleOpen}
                open={speedDialOpen}
                onMouseLeave={() => { }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={action.action}
                    />
                ))}
            </SpeedDial>
            <Backdrop className={classes.backdrop} open={openBackdrop}>
                <CircularProgress disableShrink color="inherit" />
            </Backdrop>
        </Box >
    );
}

export default Home;