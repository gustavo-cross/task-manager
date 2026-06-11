import { useEffect, useState } from 'react';
import TaskListPage from './pages/TaskListPage';

export type Theme = 'light' | 'dark';

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tm-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tm-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <TaskListPage theme={theme} onToggleTheme={toggleTheme} />;
}

export default App;
