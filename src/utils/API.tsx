
interface sourcesStateType {
    id: number,
    name: string
}

const API = {
    expenses: function (token: string | null, yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/expenses?year=${yearMonthObj.year}&month=${yearMonthObj.month}`, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
    },
    income: function (token: string | null, yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/income?year=${yearMonthObj.year}&month=${yearMonthObj.month}`, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
    },
    pivot: function (token: string | null, yearMonthObj: { form: string, year: string, month: string }): Promise<Response> {
        return fetch(`/api/pivot?year=${yearMonthObj.year}&month=${yearMonthObj.month}`, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
    },
    wallchart: function (token: string | null,): Promise<Response> {
        return fetch('/api/wallchart', {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
    },
    sources: function (token: string | null,): Promise<{ data: sourcesStateType[] }> {
        return fetch('/api/sources', {
            headers: {
                "authorization": `Bearer ${token}`
            }
        }).then(res => res.json())
    },
    persons: function (token: string | null,): Promise<{ data: sourcesStateType[] }> {
        return fetch('/api/persons', {
            headers: {
                "authorization": `Bearer ${token}`
            }
        }).then(res => res.json())
    },
    narrow: function (token: string | null,): Promise<{ data: sourcesStateType[] }> {
        return fetch('/api/narrows', {
            headers: {
                "authorization": `Bearer ${token}`
            }
        }).then(res => res.json())
    },
    broad: function (token: string | null,): Promise<{ data: sourcesStateType[] }> {
        return fetch('/api/broads', {
            headers: {
                "authorization": `Bearer ${token}`
            }
        }).then(res => res.json())
    },
    login: function (data: { username: string, password: string }): Promise<{ token: string }> {
        return fetch('/api/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
    },
    checkAuth: function (token: string | null): Promise<Response> {
        return fetch(`/api/checkAuth`, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        }).then(res => res.json())
    }
}

export default API