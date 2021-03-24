import React, { useState } from 'react'
import API from '../utils/API'
import { AuthContext } from '../App'
import type { IncomeFormType } from '../interfaces/Interfaces'
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    InputAdornment,
    Typography,
    DialogContent
} from '@material-ui/core';
// import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { saveRecord } from '../utils/db';


export default function AddRecordsForm(props: {
    classes: { root: string, formControl: string, dialog: string },
    handleClose: Function,
    setOpenBackdrop: Function
}) {

    const { Auth, setAuth, setAlertState } = React.useContext(AuthContext)

    const initialFormState = {
        date: new Date(Date.now()),
        amount: NaN,
        earner_id: NaN,
        source: "",
    }

    // Form control state
    const [formState, setFormState] = useState<IncomeFormType>(initialFormState)

    // Hard coded Ids
    const earners = [
        { name: "Alexa", id: 3 },
        { name: "Eli", id: 1 },
        { name: "Rent", id: 8 },
        { name: "Sales", id: 10 },
        { name: "Gift", id: 11 },
    ]

    function handleFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>): void {
        let name = event.target.name as keyof typeof formState
        setFormState({ ...formState, [name]: event.target.value })
    }

    function handleDateChange(date: Date | null) {
        setFormState({ ...formState, date: date });
    };

    async function handleFormSubmit(event: React.SyntheticEvent): Promise<any> {
        event.preventDefault()
        if (!formState.date || !formState.amount || !formState.earner_id || !formState.source) {
            setAlertState({
                severity: "error",
                message: "Please fill out all fields",
                open: true
            })
            return
        }
        let formStateConvertedDate: any = { ...formState }
        try {
            formStateConvertedDate.date = formStateConvertedDate.date?.toLocaleDateString("en-US")
            props.setOpenBackdrop(true)
            await API.postIncome(Auth.token, formStateConvertedDate)
            props.setOpenBackdrop(false)
            setAlertState({
                severity: "success",
                message: "Record Saved!",
                open: true
            })
        } catch (err) {
            props.setOpenBackdrop(false)
            if (err.message === "Error! 500") {
                setAlertState({
                    severity: "error",
                    message: "Server Error! Contact Eli",
                    open: true
                })
                return
            } else {
                saveRecord('income', formStateConvertedDate)
                setAlertState({
                    severity: "warning",
                    message: "Record Saved Locally",
                    open: true
                })
                if (err.message === "Unauthorized") {
                    setAuth({ type: 'LOGOUT' })
                }
            }
        } finally {
            setFormState(initialFormState)
        }
    }

    return (
            <DialogContent>
                <Typography variant="h5" component="h5" className={props.classes.root}>Log Income</Typography>
                <form className={props.classes.root} onSubmit={handleFormSubmit}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="date-picker-inline"
                            name="Date"
                            label="Date"
                            value={formState.date}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                    <TextField
                        onChange={handleFormChange}
                        value={formState.source}
                        label="Source"
                        name="source"
                        type="string"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        onChange={handleFormChange}
                        value={formState.amount}
                        label="Amount"
                        name="amount"
                        type="number"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ step: "0.01" }}
                    />
                    <FormControl className={props.classes.formControl}>
                        <InputLabel htmlFor="earner_id">Person</InputLabel>
                        <Select
                            onChange={handleFormChange}
                            value={formState.earner_id}
                            name="earner_id"
                            labelId="earner_id"
                            label="Person"
                        >
                            {earners.map(i => (
                                <MenuItem value={i.id}>{i.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >Submit</Button>
                    <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            setFormState(initialFormState)
                            props.handleClose()
                        }}
                    >Close</Button>
                </form>
            </DialogContent>
    )
}