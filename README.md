# EVE Online Signature Scanner

This is a web-based tool designed for EVE Online players to help manage cosmic signature scan results when re-scanning systems between session changes. It allows users to paste raw scan data from the game, parse it into a structured table, and then manage these signatures by marking them as favourites, ignoring them, or removing them. The tool utilizes browser local storage to persist signature states (known, favourited, ignored) across sessions.

## Features

*   **Parse EVE Scan Results**: Directly paste and process signature data copied from the EVE Online client.
*   **Signature Management**:
    *   **Known Signatures**: Automatically marks signatures that have been seen before (within a 3-day expiration period).
    *   **Favourites**: Mark important signatures for easy tracking.
    *   **Ignore**: Hide irrelevant or completed signatures.
    *   **Remove**: Delete signatures from the current list.
*   **Persistent Storage**: Signature states (known, favourited, ignored) are saved in the browser's local storage.
*   **Filtering**: Option to show only unknown signatures.
*   **Signal Strength Indicator**: Visual progress bar for signal strength.
*   **Responsive Table**: Displays signature details in a clear, sortable table.

## How to Use

1.  **Copy Scan Results**: In EVE Online, open the Probe Scanner window (ALT+P). Select all signature results (CTRL+A) and copy them (CTRL+C).
2.  **Paste into Tool**: Paste the copied data into the text area provided in the Signature Scanner tool.
3.  **Check Signatures**: Click the "Process Signatures" button. The tool will parse the data and display it in the table below.
4.  **Refresh Signatures**: If you want to refresh the signatures without considering the current known state, click the "Refresh Signatures" button (the circular arrow icon). This will re-parse the input text and update the display.
5.  **Manage Signatures**:
    *   Use the star icon to toggle a signature as a favourite.
    *   Use the eye-off icon to toggle a signature as ignored (it will be greyed out and struck through).
    *   Use the trash icon to remove a signature from the current view.
    *   Toggle the "Show Only Unknown" switch to filter the list.
6.  **Data Persistence**: Your known, favourited, and ignored signatures will be remembered the next time you use the tool in the same browser. Known signatures expire after 3 days.
7.  **Delete All Data**: Click the "Delete All" button to clear all signatures from the display and remove all data from local storage.

## Tech Stack

*   **React**: For building the user interface.
*   **TypeScript**: For type safety and improved developer experience.
*   **Tailwind CSS**: For styling the application.
*   **Lucide React**: For icons.
*   **shadcn/ui**: For UI components (Card, Table, Button, Switch, etc.).

## Development

To run this project locally:

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd eve-sig
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This will typically open the application in your browser at `http://localhost:3000` or a similar address.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find any bugs, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5.  Push to the branch (`git push origin feature/AmazingFeature`).
6.  Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE.md) - see the LICENSE.md file for details.
