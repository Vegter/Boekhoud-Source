import React, { useRef } from 'react'

import { Button } from "@material-ui/core";

interface FileLoaderProps {
    onLoad: (result: any) => void,
    readAsArrayBuffer?: boolean,
    title: string,
    accept: string
}

function FileLoader(props: FileLoaderProps) {
    const hiddenFileInput = useRef<any>(null)

    function readFiles(files: File[]) {
        for (let file of files) {
            const reader = new FileReader()

            reader.onload = () => {
                if (reader.result) {
                    props.onLoad(reader.result)
                }
            };

            reader.onerror = () => {
                props.onLoad(null)
            }

            reader.onabort = () => {
                props.onLoad(null)
            }

            if (props.readAsArrayBuffer) {
                reader.readAsArrayBuffer(file)
            } else {
                reader.readAsText(file)
            }
        }
    }

    function onClick() {
        hiddenFileInput.current.click()
    }

    function onFileSelected(e:React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()

        const fileList:FileList | null = e.target.files

        if (fileList) {
            readFiles(Array.from(fileList))
        }
    }

    return (
        <Button variant={"contained"}
                aria-label={props.title}
                onClick={onClick}
                color={"primary"}>
            {props.title}
            <input type="file"
                   ref={hiddenFileInput}
                   multiple={true}
                   accept={props.accept}
                   onChange={e => onFileSelected(e)} hidden/>
        </Button>
    );
}

export default FileLoader