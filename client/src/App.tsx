import { ThemeProvider } from './context/ThemeContext';
import { GlobalErrorBoundary } from './components/ErrorBoundary/GlobalErrorBoundary';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
