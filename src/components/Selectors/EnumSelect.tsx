import React, { useState } from 'react'
import { Checkbox, FormControlLabel } from "@material-ui/core"
import { createStyles, makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(() =>
    createStyles({
        legend: {
            marginLeft: -20
        },
    }),
);

interface Stringable {
    toString: () => string
}

interface EnumSelectorProps<T> {
    title: string
    allValues: T[]
    selectedValues: T[]
    onValues: (values: string[]) => void
}

function EnumSelector<T extends Stringable>(props: EnumSelectorProps<T>) {
    const [values, setValues] = useState<string[]>(props.selectedValues.map(v => v.toString()))
    const [timer, setTimer] = useState<any>(null)

    const classes = useStyles()

    const allValues:string[] = props.allValues.map(v => v.toString())

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:string = event.target.name
        clearTimeout(timer)

        const newValues = event.target.checked
            ? [...values, value]
            : values.filter(l => l !== value)

        if (newValues.length) {
            setValues(newValues)

            const timeout = 500
            setTimer(setTimeout(() => {
                // Try to collect succeeding keystrokes
                props.onValues(newValues)
            },  timeout))
        }
    };

    return (
        <>
            {/*<FormLabel component="legend">*/}
                <div className={classes.legend}>{props.title}</div>
            {/*</FormLabel>*/}
            <div>
                {allValues.map(value => {
                    return (
                        <FormControlLabel key={value}
                                          control={
                                              <Checkbox
                                                  disabled={values.includes(value) && values.length === 1}
                                                  size={"small"}
                                                  checked={values.includes(value)}
                                                  onChange={onChange}
                                                  name={value}
                                                  color="primary"
                                              />
                                          }
                                          label={value}
                        />)
                })}
            </div>
        </>
    )
}

export default EnumSelector;
