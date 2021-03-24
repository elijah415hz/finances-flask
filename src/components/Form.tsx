import React from 'react'
import {
    Container,
    Card,
    FormControl,
    InputLabel,
    Select,
    TextField,
    MenuItem,
    Button
} from '@material-ui/core'
import { FormStateType } from '../interfaces/Interfaces'

export default function Form({
    classes,
    handleFormSubmit,
    handleFormChange,
    formState }: {
        classes: {
            root: string,
            formControl: string
        },
        handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
        handleFormChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | React.ChangeEvent<HTMLSelectElement>) => void,
        formState: FormStateType
    }) {
    return (
        <Container className={classes.root}>
            <Card variant="outlined">
                <form onSubmit={handleFormSubmit} className={classes.root}>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel htmlFor="form">Report</InputLabel>
                        <Select
                            name="form"
                            label="Report"
                            labelId="form"
                            value={formState.form}
                            onChange={handleFormChange}>
                            <MenuItem value="expenses">Expenses</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                            <MenuItem value="pivot">Pivot Table</MenuItem>
                            <MenuItem value="search">Search</MenuItem>
                        </Select>
                    </FormControl>
                    {formState.form === "search" ? (
                        <>
                            <TextField
                                onChange={handleFormChange}
                                value={formState.search}
                                label="Search"
                                name="search"
                                type="text"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </>
                    ) : (
                            <>
                                <TextField
                                    onChange={handleFormChange}
                                    value={formState.year}
                                    label="Year"
                                    name="year"
                                    type="number"
                                    variant="outlined"
                                />
                                <FormControl variant="outlined" className={classes.formControl}>
                                    <InputLabel htmlFor="month2">Month</InputLabel>
                                    <Select
                                        onChange={handleFormChange}
                                        value={formState.month}
                                        name="month"
                                        labelId="month2"
                                        label="Month"
                                    >
                                        <MenuItem value={1}>January</MenuItem>
                                        <MenuItem value={2}>February</MenuItem>
                                        <MenuItem value={3}>March</MenuItem>
                                        <MenuItem value={4}>April</MenuItem>
                                        <MenuItem value={5}>May</MenuItem>
                                        <MenuItem value={6}>June</MenuItem>
                                        <MenuItem value={7}>July</MenuItem>
                                        <MenuItem value={8}>August</MenuItem>
                                        <MenuItem value={9}>September</MenuItem>
                                        <MenuItem value={10}>October</MenuItem>
                                        <MenuItem value={11}>November</MenuItem>
                                        <MenuItem value={12}>December</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        View
                        </Button>
                </form>
            </Card>
        </Container>
    )
}