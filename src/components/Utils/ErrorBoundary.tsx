import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorMessage from "./ErrorMessage"

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean
    error: Error | null
}

const initialState:State = {
    hasError: false,
    error: null
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {...initialState}

    public static getDerivedStateFromError(error: Error): State {
        // Update lastState so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private onAcknowledge = () => {
        this.setState({...initialState})
    }

    public render() {
        if (this.state.hasError) {
            return <ErrorMessage title={"Sorry.. there was an error"}
                                 errorMsg={this.state.error?.message}
                                 onAcknowledge={this.onAcknowledge}/>
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
