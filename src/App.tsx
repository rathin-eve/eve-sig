import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { SignatureScanner } from './components/SignatureScanner'
import { EyeOff, Star, Trash2 } from 'lucide-react'

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="p-4 absolute right-2 top-2">
        <ModeToggle />
      </div>
      <SignatureScanner />

      <div className="w-full max-w-5xl mx-auto text-left mt-4">
        <h2 className="text-lg font-bold">EVE Online Signature Scanner</h2>
        <p className="text-sm text-gray-600">
          This tool helps you re-scan and analyze signatures in EVE Online. Enter your signature data to get started.
        </p>
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">How to Use</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>Copy Scan Results</strong>: In EVE Online, open the Probe Scanner window (ALT+P). Select all signature results (CTRL+A) and copy them (CTRL+C).
            </li>
            <li>
              <strong>Paste into Tool</strong>: Paste the copied data into the text area provided in the Signature Scanner tool above.
            </li>
            <li>
              <strong>Process Signatures</strong>: Click the "Process Signatures" button. The tool will parse the data and display it in the table below.
            </li>
            <li>
              <strong>Manage Signatures</strong>:
              <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5">
          <li>Use the <Star className="h-4 w-4 inline-block" /> icon to toggle a signature as a favourite. Useful to quickly know which signatures you want to scan again when entering system.</li>
          <li>Use the <EyeOff className="h-4 w-4 inline-block" /> icon to toggle a signature as ignored (it will be greyed out and struck through).</li>
          <li>Use the <Trash2 className="h-4 w-4 text-red-500 inline-block" /> icon to remove a signature from the current view.</li>
          <li>Toggle the "Show Only Unknown" switch to filter the list to signatures you have not previously pasted.</li>
              </ul>
            </li>
            <li>
              <strong>Data Persistence</strong>: Your known, favourited, and ignored signatures will be remembered the next time you use the tool in the same browser. Known signatures expire after 3 days.
            </li>
            <li>
              <strong>Delete All Data</strong>: Click the "Delete All" button to clear all signatures from the display and remove all data stored in browser local storage for this page.
            </li>
          </ol>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-500 mt-4">
        <p><a href="https://github.com/rathin-eve/eve-sig" target="_blank" rel="noopener noreferrer" className="underline">GitHub Repository</a></p>
        <p>All EVE related materials are property of CCP Games</p>
      </footer>
    </ThemeProvider>
  )
}

export default App
