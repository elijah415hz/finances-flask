interface FormStateType {
    form: "expenses" | "income" | "pivot" | "search",
    year: number,
    month: number,
    search: string
}

type InputName = "Person" | "Source" | "Broad_category" | "Narrow_category" | "Vendor"

interface TableDataEntry {
    Amount: number,
    Date?: string,
    Source?: string,
    Person?: string,
    id?: number,
    source_id?: number,
    earner_id?: number,
    Vendor?: string,
    Broad_category?: string,
    Narrow_category?: string,
    Notes?: string,
    entry_id?: number
}

interface ExpensesFormType {
    Date: Date | null,
    Amount: number,
    person_id: number,
    broad_category_id: number,
    narrow_category_id: number,
    vendor: string,
    notes: string
}

interface IncomeFormType {
    date: Date | null,
    amount: number,
    earner_id: number,
    source: string,
}

interface CategoryType {
    name: string,
    id: number,
    narrowCategories?: {
        name: string, id: number
    }[],
    person?: boolean
}

interface DataListStateType {
    id: number,
    name: string
}

interface AllDataListsType {
    source: DataListStateType[],
    person_earner: DataListStateType[],
    narrow_category: DataListStateType[],
    broad_category: DataListStateType[],
    vendor: DataListStateType[]
}

interface TableType {
    schema: {
        fields: []
    },
    data: TableDataEntry[]
}

interface AlertStateType {
    severity: "success" | "info" | "warning" | "error" | undefined,
    message: string,
    open: boolean,
}

interface Auth {
    loggedIn: boolean,
    user: string,
    token: string
  };
  
  interface ContextState {
    Auth: Auth,
    setAuth: React.Dispatch<{ type: string; payload?: { user: string; token: string; } | undefined; }>,
    setAlertState: React.Dispatch<React.SetStateAction<AlertStateType>>
  };

export type {
    TableDataEntry,
    DataListStateType,
    AllDataListsType,
    FormStateType,
    InputName,
    TableType,
    ExpensesFormType,
    IncomeFormType,
    CategoryType,
    AlertStateType,
    Auth,
    ContextState
}