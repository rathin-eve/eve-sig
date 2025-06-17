import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { SignatureScanner } from './components/SignatureScanner'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-4 absolute right-2 top-2">
        <ModeToggle />
      </div>
      <SignatureScanner />
      <footer className="text-center text-xs text-gray-500 mt-4">
        <p><a href="https://github.com/rathin-eve/eve-sig" target="_blank" rel="noopener noreferrer" className="underline">GitHub Repository</a></p>
        <p>All EVE related materials are property of CCP Games</p>
      </footer>
    </ThemeProvider>
  )
}

export default App
