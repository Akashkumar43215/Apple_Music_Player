import { Component } from 'react';
import ServerErrorPage from '../../pages/ServerErrorPage';

/**
 * Catches unhandled render errors anywhere in the component tree below it
 * and shows the 500 page instead of a blank white screen.
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
