import React, { useState } from 'react'
import API from '../utils/API'
import { saveRecord } from '../utils/db'
import { AuthContext } from '../App'
import type { ExpensesFormType, CategoryType } from '../interfaces/Interfaces'
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




export default function AddRecordsForm(props: {
    classes: { root: string, formControl: string},
    handleClose: Function,
    setLoading: Function
}) {
    const { Auth, setAuth, setAlertState } = React.useContext(AuthContext)

    const initialFormState = {
        Date: new Date(Date.now()),
        Amount: NaN,
        person_id: NaN,
        broad_category_id: NaN,
        narrow_category_id: NaN,
        vendor: "",
        notes: ""
    }

    // Form control state
    const [formState, setFormState] = useState<ExpensesFormType>(initialFormState)

    // State to hold category info
    const [currentCategory, setCurrentCategory] = useState<CategoryType>({
        name: "",
        id: NaN,
    })

    // Hardcoding categories because the database is a mess...
    const categories = [
        {
            name: "Groceries", id: 6, narrowCategories: [
                { name: "Food", id: 10 },
                { name: "Alcohol", id: 49 },
                { name: "Entertaining", id: 7 }
            ]
        },
        {
            name: "Health and Body", id: 12, narrowCategories: [
                { name: "Toiletries", id: 27 },
                { name: "Make-up", id: 51 },
                { name: "Drugs/Supplements", id: 273 },
                { name: "Doctors Visits", id: 24 },
                { name: "Gym", id: 34 },
                { name: "Essential Oils", id: 58 },
                { name: "Massages/Body Care", id: 41 }
            ], person: true
        },
        {
            name: "Work", id: 8, narrowCategories: [
                { name: "Road Food Out", id: 20 },
                { name: "Road Groceries", id: 37 },
                { name: "Road Coffee", id: 21 },
                { name: "Business Food", id: 70 },
                { name: "Scores", id: 68 },
                { name: "Office Supplies", id: 11 },
                { name: "Plane Tickets", id: 18 },
                { name: "Transportation", id: 9 },
                { name: "Union Dues", id: 55 },
                { name: "Dry Cleaning", id: 14 },
                { name: "Concert Tickets", id: 655 },
                { name: "Lessons/Coachings", id: 69 },
                { name: "Application fees", id: 61 },
                { name: "Pianist Fees", id: 656 }
            ], person: true
        },
        {
            name: "Eating Out", id: 3, narrowCategories: [
                { name: "Date", id: 28 },
                { name: "Friends", id: 3 },
                { name: "Snacks", id: 17 },
                { name: "On the Run", id: 8 },
                { name: "Coffee", id: 30 },
                { name: "Ordering in", id: 48 },
            ]
        },
        {
            name: "Home Goods", id: 9, narrowCategories: [
                { name: "Kitchen", id: 12 },
                { name: "Decorating", id: 29 },
                { name: "Furniture", id: 16 },
                { name: "Paper Products/Cleaning", id: 15 },
                { name: "Office Supplies", id: 11 },
                { name: "Hobbies/Creative", id: 23 },
                { name: "Linens", id: 201 },
            ]
        },
        {
            name: "New York Home", id: 1, narrowCategories: [
                { name: "Rent", id: 40 },
                { name: "Internet", id: 1 },
                { name: "Electricity", id: 26 },
            ]
        },
        {
            name: "Seattle Home", id: 7, narrowCategories: [
                { name: "Mortgage", id: 39 },
                { name: "HOA", id: 38 },
                { name: "Taxes", id: 657 },
                { name: "Internet", id: 1 },
                { name: "Electricity", id: 26 },
                { name: "Manager/Maintanence", id: 42 },
                { name: "Insurance", id: 134 },
            ]
        },
        { name: "Clothes", id: 11, person: true },
        {
            name: "Laundry", id: 4, narrowCategories: [
                { name: "Laundry", id: 4 },
                { name: "Dry Cleaning", id: 14 },
            ]
        },
        {
            name: "Entertainment", id: 14, narrowCategories: [
                { name: "Live Shows", id: 32 },
                { name: "Movies", id: 44 },
                { name: "Museums", id: 53 },
                { name: "Books", id: 36 },
                { name: "Home (Netflix, Spotify, Amazon, Movie Rentals)", id: 46 },
                { name: "Newspaper/Magazine", id: 47 },
            ]
        },
        { name: "Philanthropy", id: 17 },
        {
            name: "Electronics", id: 5, narrowCategories: [
                { name: "Phone Bill", id: 33 },
                { name: "Computers", id: 588 },
                { name: "Accessories", id: 31 },
                { name: "Cloud Storage Fees", id: 6 },
            ]
        },
        { name: "Gifts", id: 13 },
        {
            name: "Transportation", id: 2, narrowCategories: [
                { name: "Gas", id: 22 },
                { name: "Repairs", id: 577 },
                { name: "Insurance", id: 134 },
                { name: "Bike", id: 567 },
                { name: "Subway", id: 35 },
                { name: "Taxi/Lyft", id: 5 },
                { name: "Car Rental", id: 2 },
                { name: "Seattle Airplanes", id: 276 },
                { name: "Parking", id: 209 },
            ]
        },
        {
            name: "Maggie", id: 10, narrowCategories: [
                { name: "Food", id: 10 },
                { name: "Litter", id: 13 },
                { name: "Vet Bills", id: 275 },
                { name: "Toys", id: 60 },
            ]
        },
        {
            name: "Travel/Leisure", id: 16, narrowCategories: [
                { name: "Planes", id: 62 },
                { name: "Ground Transportation", id: 52 },
                { name: "Food", id: 10 },
                { name: "Experiences", id: 64 },
                { name: "Lodging", id: 43 },
            ]
        },
        {
            name: "Legal", id: 19, narrowCategories: [
                { name: "Documents", id: 202 },
                { name: "Services", id: 63 },
            ]
        },
        { name: "Student Loans", id: 15 },
        { name: "Education", id: 18, person: true },
        {
            name: "Theo", id: 75, narrowCategories: [
                { name: "Baby sitting", id: 274 },
                { name: "Toys", id: 60 },
            ]
        }
    ]

    const persons = [
        { name: "Alexa", id: 3 },
        { name: "Eli", id: 1 },
        { name: "Theo", id: 2 }
    ]

    function handleFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>): void {
        let name = event.target.name as keyof typeof formState
        setFormState({ ...formState, [name]: event.target.value })
        if (name === 'broad_category_id') {
            let category = categories.filter(i => i.id === event.target.value)[0]
            setCurrentCategory(category)
        }
    }

    function handleDateChange(date: Date | null) {
        setFormState({ ...formState, Date: date });
    };

    async function handleFormSubmit(event: React.SyntheticEvent): Promise<any> {
        event.preventDefault()
        if (!formState.Date || !formState.Amount || !formState.broad_category_id || !formState.vendor) {
            setAlertState({
                severity: "error",
                message: "Please fill out all fields",
                open: true
            })
            return
        }
        let formStateConvertedDate: any = { ...formState }
        formStateConvertedDate.Date = formStateConvertedDate.Date?.toLocaleDateString("en-US")
        try {
            props.setLoading(true)
            await API.postExpenses(Auth.token, formStateConvertedDate)
            props.setLoading(false)
            setAlertState({
                severity: "success",
                message: "Record Saved!",
                open: true
            })
        } catch (err) {
            props.setLoading(false)
            if (err.message === "Error! 500") {
                setAlertState({
                    severity: "error",
                    message: "Server Error! Contact Eli",
                    open: true
                })
                return
            } else {
                saveRecord('expenses', formStateConvertedDate)
                if (err.message === "Unauthorized") {
                    setAuth({ type: 'LOGOUT' })
                }
                setAlertState({
                    severity: "warning",
                    message: "Record Saved Locally",
                    open: true
                })
            }
        } finally {
            setFormState(initialFormState)
            setCurrentCategory({
                name: "",
                id: NaN
            })
        }
    }
 
    return (
            <DialogContent>
            <Typography variant="h5" component="h5" className={props.classes.root}>Log Expense</Typography>
            <form className={props.classes.root} onSubmit={handleFormSubmit}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        disableToolbar
                        fullWidth
                        autoOk={true}
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        name="Date"
                        label="Date"
                        value={formState.Date}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}                        
                        />
                </MuiPickersUtilsProvider>
                <TextField
                    onChange={handleFormChange}
                    value={formState.vendor}
                    label="Vendor"
                    name="vendor"
                    type="string"
                    InputLabelProps={{ shrink: true }}
                    />
                <TextField
                    onChange={handleFormChange}
                    value={formState.Amount}
                    label="Amount"
                    name="Amount"
                    type="number"
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ step: "0.01" }}
                    />
                <FormControl
                    className={props.classes.formControl}>
                    <InputLabel htmlFor="broad_category">Broad Category</InputLabel>
                    <Select
                        onChange={handleFormChange}
                        value={formState.broad_category_id}
                        name="broad_category_id"
                        labelId="broad_category"
                        label="Broad Category"
                        >
                        {categories.map(i => (
                            <MenuItem value={i.id}>{i.name}</MenuItem>
                            ))}
                    </Select>
                </FormControl>
                {currentCategory.narrowCategories ? (
                    <FormControl className={props.classes.formControl}>
                        <InputLabel htmlFor="narrow_category">Narrow Category</InputLabel>
                        <Select
                            onChange={handleFormChange}
                            value={formState.narrow_category_id}
                            name="narrow_category_id"
                            labelId="narrow_category"
                            label="Narrow Category"
                            >
                            {/* Get the list of narrow categories corresponding to the selected broad category */}
                            {currentCategory.narrowCategories?.map(i => (
                                <MenuItem value={i.id}>{i.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : null}
                {currentCategory.person ? (
                    
                    <FormControl className={props.classes.formControl}>
                        <InputLabel htmlFor="person_id">Person</InputLabel>
                        <Select
                            onChange={handleFormChange}
                            value={formState.person_id}
                            name="person_id"
                            labelId="person_id"
                            label="Person"
                            >
                            {persons.map(i => (
                                <MenuItem value={i.id}>{i.name}</MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                ) : null}
                <TextField
                    onChange={handleFormChange}
                    value={formState.notes}
                    label="Notes"
                    name="notes"
                    type="string"
                    InputLabelProps={{ shrink: true }}
                    />
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
                    }
                }
                >Close</Button>
            </form>
                </DialogContent>
    )
}