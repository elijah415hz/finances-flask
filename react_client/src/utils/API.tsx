
const API: { expenses: Function, income: Function, pivot: Function, wallchart: Function } = {
    expenses: function (yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/expenses?year=${yearMonthObj.year}&month=${yearMonthObj.month}`)
    },
    income: function (yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/income?year=${yearMonthObj.year}&month=${yearMonthObj.month}`)
    },
    pivot: function (yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/pivot?year=${yearMonthObj.year}&month=${yearMonthObj.month}`)
    },
    wallchart: function (): Promise<Response> {
        return fetch('/api/wallchart')
    }
}

export default API