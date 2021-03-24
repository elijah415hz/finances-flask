import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from './Alert'
import { makeStyles, Theme } from '@material-ui/core/styles';
import { AlertStateType } from '../interfaces/Interfaces';


const useStyles = makeStyles((theme: Theme) => ({
    snackbar: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

export default function CustomizedSnackbar({ state, setState }: {
    state: AlertStateType,
    setState: React.Dispatch<React.SetStateAction<AlertStateType>>
    }) {

    const classes = useStyles();

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setState({ ...state, open: false });
    };

    return (
        <div className={classes.snackbar}>
            <Snackbar
                open={state.open}
                autoHideDuration={3000}
                onClose={handleClose}

            >
                <Alert onClose={handleClose} severity={state.severity}>
                    {state.message}
                </Alert>
            </Snackbar>
        </div>
    );
}