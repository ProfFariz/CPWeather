import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  error: Error | null
}

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CPWeather render error:', error, errorInfo)
  }

  handleTryAgain = () => {
    this.setState({
      error: null,
    })
  }

  handleReloadPage = () => {
    window.location.reload()
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    return (
      <div className="page-shell">
        <div className="page-grid mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="surface-panel p-8 text-center sm:p-10">
            <span className="surface-chip text-xs uppercase tracking-[0.28em] text-sky-700">
              App Recovery
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              The dashboard hit a runtime issue, but the page does not have to go blank.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This fallback catches render errors at the app root, so you still get a recovery
              screen instead of a white page.
            </p>

            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Error message
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {error.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={this.handleTryAgain} className="primary-button">
                Try rendering again
              </button>
              <button type="button" onClick={this.handleReloadPage} className="secondary-button">
                Reload page
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }
}

export default AppErrorBoundary
