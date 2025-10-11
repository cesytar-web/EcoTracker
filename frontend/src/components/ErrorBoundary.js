import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p> Hubo un error al renderizar el gráfico. </p>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
