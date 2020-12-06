import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import API from '../utils/API'
import { AuthContext } from '../App'
import type { tableDataEntry, dataListStateType, formStateType, InputName } from '../interfaces/Interfaces'

function Home() {
    const { Auth, setAuth } = React.useContext(AuthContext)
    const [formState, setFormState] = useState<formStateType>(
        {
            form: "income",
            year: "",
            month: ""
        }
    )

    const [incomeTableState, setIncomeTableState] = useState<{ schema: { fields: [] }, data: tableDataEntry[] }>(
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

    const [expensesTableState, setExpensesTableState] = useState<{ schema: { fields: [] }, data: tableDataEntry[] }>(
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
    const [pivotTableState, setPivotTableState] = useState<{ schema: { fields: [] }, data: tableDataEntry[] }>(
        {
            schema: { fields: [] },
            data: [{
                Amount: "",
                Broad_category: "",
                Narrow_category: ""
            }]
        }
    )

    // State for datalists
    const [sourcesState, setSourcesState] = useState<dataListStateType[]>([])
    const [personsState, setPersonsState] = useState<dataListStateType[]>([])
    const [broadState, setBroadState] = useState<dataListStateType[]>([])
    const [narrowState, setNarrowState] = useState<dataListStateType[]>([])
    const [vendorsState, setVendorsState] = useState<dataListStateType[]>([])

    function formatDates(entry: tableDataEntry): tableDataEntry {
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

    function handleFormChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>): void {
        let { name, value } = event.target;
        setFormState({ ...formState, [name]: value })
    }

    async function handleFormSubmit(event: React.SyntheticEvent): Promise<any> {
        try {
            event.preventDefault()
            let route = formState.form
            let response = await API[route](Auth.token, formState)
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
                    setPivotTableState(response)
                    break;
            }
        } catch (err) {
            if (err.message === "Unauthorized") {
                setAuth({ type: 'LOGOUT' })
            }
        }
    }

    function assignId(
        name: InputName,
        value: string) {

        let state;
        let id;

        switch (name) {
            case "Person":
                state = personsState;
                id = 'person_id';
                break;
            case "Source":
                state = sourcesState;
                id = 'source_id';
                break;
            case "Broad_category":
                state = broadState;
                id = 'broad_category_id';
                break;
            case "Narrow_category":
                state = narrowState;
                id = 'narrow_category_id';
                break;
            case "Vendor":
                state = vendorsState;
                id = 'vendor_id';
                break;
        }
        let dataListItem = state.filter((i: dataListStateType) => i.name === value)[0]
        if (dataListItem) {
            return { id: id, dataListItem: dataListItem }
        } else {
            return { id: null, dataListItem: null }
        }
    }

    async function handleExpensesChange(event: React.ChangeEvent<HTMLInputElement>, index: number): Promise<void> {
        try {
            let { name, value } = event.target;
            let newExpensesTableStateData: tableDataEntry[] = [...expensesTableState.data]
            let updatedRow: tableDataEntry = { ...newExpensesTableStateData[index], [name]: value }
            if (name === "Person" || name === "Broad_category" || name === "Narrow_category" || name === "Vendor") {
                let { id, dataListItem } = assignId(name as InputName, value)
                if (id && dataListItem) {
                    updatedRow = { ...updatedRow, [id]: dataListItem.id }
                }
            }
            newExpensesTableStateData[index] = updatedRow
            setExpensesTableState({ ...expensesTableState, data: newExpensesTableStateData })
            let res = await API.updateExpenses(Auth.token, updatedRow)
            console.log(res)
        } catch (err) {
            console.error(err)
            if (err.message === "Unauthorized") {
                setAuth({ type: 'LOGOUT' })
            }
        }
    }

    async function handleIncomeChange(event: React.ChangeEvent<HTMLInputElement>, index: number): Promise<void> {
        try {
            let { name, value } = event.target;
            let newIncomeTableStateData: tableDataEntry[] = [...incomeTableState.data]
            let updatedRow: tableDataEntry = { ...newIncomeTableStateData[index], [name]: value }
            if (name === "Person" || name === "Source") {
                let { id, dataListItem } = assignId(name as InputName, value)
                if (id && dataListItem) {
                    updatedRow = { ...updatedRow, [id]: dataListItem.id }
                }
            }
            newIncomeTableStateData[index] = updatedRow
            setIncomeTableState({ ...incomeTableState, data: newIncomeTableStateData })
            let res = await API.updateIncome(Auth.token, updatedRow)
            console.log(res)
        } catch (err) {
            console.error(err)
            if (err.message === 'Unauthorized') {
                setAuth({ type: 'LOGOUT' })
            }
        }
    }

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

    useEffect(() => {
        async function getDataLists(): Promise<void> {
            let { data } = await API.sources(Auth.token)
            setSourcesState(data)
            let persons = await API.persons(Auth.token)
            setPersonsState(persons.data)
            let narrow = await API.narrow(Auth.token)
            setNarrowState(narrow.data)
            let broad = await API.broad(Auth.token)
            setBroadState(broad.data)
            let vendors = await API.vendors(Auth.token)
            setVendorsState(vendors.data)
        }
        getDataLists()
    }, [])

    return (
        <div className="Home">
            <header className="header">
                <button className="logout" onClick={() => setAuth({ type: 'LOGOUT' })}>Logout</button>
                <h1>Finances!</h1>
                {Auth.token ?
                    <img src="/wallchart" alt="Wall Chart" />
                    : null
                }
                <form onSubmit={handleFormSubmit} className="form-inline">
                    <select name="form" value={formState.form} onChange={handleFormChange}>
                        <option value="income">Income</option>
                        <option value="expenses">Expenses</option>
                        <option value="pivot">Pivot Table</option>
                    </select>
                    <label htmlFor="year2">Year</label>
                    <input
                        onChange={handleFormChange}
                        value={formState.year}
                        type="text"
                        id="year2"
                        className="form-control"
                        name="year"
                        placeholder="YYYY"
                    />
                    <label htmlFor="month2">Month</label>
                    <input
                        onChange={handleFormChange}
                        value={formState.month}
                        type="text"
                        id="month2"
                        className="form-control"
                        name="month"
                        placeholder="MM" />
                    <button className="btn btn-success">Submit</button>
                </form>
            </header>
            <div className="body">
                {formState.form === "income" && incomeTableState.data[0]?.id ? (
                    <Table
                        state={incomeTableState}
                        sourcesState={sourcesState}
                        personsState={personsState}
                        handleChange={handleIncomeChange}
                        setSourcesState={setSourcesState}
                        setPersonsState={setPersonsState}
                        deleteEntry={deleteEntry}
                        form={formState.form}
                    />
                ) : null}
                {formState.form === "expenses" && expensesTableState.data[0]?.entry_id ? (
                    <Table
                        state={expensesTableState}
                        personsState={personsState}
                        broadState={broadState}
                        narrowState={narrowState}
                        vendorsState={vendorsState}
                        handleChange={handleExpensesChange}
                        setPersonsState={setPersonsState}
                        setBroadState={setBroadState}
                        setNarrowState={setNarrowState}
                        deleteEntry={deleteEntry}
                        form={formState.form}
                    />
                ) : null}
                {formState.form === "pivot" && pivotTableState ? (
                    <Table
                        state={pivotTableState}
                        deleteEntry={deleteEntry}
                        handleChange={() => false}
                        form={formState.form}
                    />
                ) : null}
            </div>
        </div>
    );
}

export default Home;