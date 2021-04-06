import { Theme } from "@material-ui/core/styles"

export const drawerWidth = 250

export const toolbarStyle = (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
})
