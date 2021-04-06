import { useTheme } from "@material-ui/core/styles"
import { useMediaQuery } from "@material-ui/core"

type StylingOptions = {
    variant: "outlined" | "standard" | "filled"
    inputProps: {
        disableUnderline?: boolean
    }
}

export function useResponsiveStyling(): StylingOptions {
    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    return onXs
        ? { variant: "outlined", inputProps: {}}
        : { variant: "standard", inputProps: { disableUnderline: true }}
}
