import React from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2),
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    });


export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string
    subTitle?: string
    children: React.ReactNode
    onClose?: () => void
}

export const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, subTitle, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
            {subTitle && <span>{subTitle}</span>}
        </MuiDialogTitle>
    );
});

export const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

export const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

// function TemplateDialog() {
//     const [open, setOpen] = React.useState(false);
//     const theme = useTheme()
//     const onXs = useMediaQuery(theme.breakpoints.only('xs'));
//
//
//     const handleClickOpen = () => {
//         setOpen(true);
//     };
//     const handleClose = () => {
//         setOpen(false);
//     };
//
//     return (
//         <div>
//             <Button variant="outlined" color="primary" onClick={handleClickOpen}>
//                 Open dialog
//             </Button>
//             <Dialog fullWidth={false} fullScreen={onXs} maxWidth={false}
//                     onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
//                 <DialogTitle id="customized-dialog-title" onClose={handleClose}>
//                     Modal title
//                 </DialogTitle>
//                 <DialogContent dividers>
//                     <Typography gutterBottom>
//                         Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
//                         in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
//                     </Typography>
//                     <Typography gutterBottom>
//                         Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
//                         lacus vel augue laoreet rutrum faucibus dolor auctor.
//                     </Typography>
//                     <Typography gutterBottom>
//                         Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
//                         scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
//                         auctor fringilla.
//                     </Typography>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button autoFocus onClick={handleClose} color="primary">
//                         Save changes
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// }
