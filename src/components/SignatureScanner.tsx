import { useState, useMemo, useEffect } from "react";
import { Star, EyeOff, Trash2, ArrowUpDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Signature {
  id: string;
  type: string;
  subType: string;
  name: string;
  signal: string;
  distance: string;
  signalStrength: number; // Parsed signal strength
  isKnown: boolean;
  isFavourited: boolean;
  isIgnored: boolean;
}

// core data stored in knownSignatures
interface StoredSignatureData {
  id: string;
  type: string;
  subType: string;
  name: string;
  signal: string;
  distance: string;
  signalStrength: number;
}

type SignatureStoreEntry = {
  data: StoredSignatureData;
  timestamp: number; // Timestamp when this signature was last updated
};

type KnownSignatureStore = { [id: string]: number | SignatureStoreEntry };

// --- Sorting ---
type SortKey = "id" | "status" | "type" | "name" | "signal" | "distance";
interface SortConfig {
  key: SortKey | null;
  direction: "ascending" | "descending";
}

// --- Constants ---
const KNOWN_SIGNATURES_KEY = "knownSignatures";
const FAVOURITED_SIGNATURES_KEY = "favouritedSignatures";
const IGNORED_SIGNATURES_KEY = "ignoredSignatures";
const SHOW_ONLY_UNKNOWN_KEY = "showOnlyUnknownFilter";
const EXPIRATION_DAYS = 6;
const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

const sampleData = `IVW-652	Cosmic Signature			0.0%	34.37 AU
LLX-689	Cosmic Signature	Combat Site	Amarr Rendezvous Point	100.0%	15.77 AU
OQW-108	Cosmic Signature			10.2%	14.80 AU
VRZ-889	Cosmic Anomaly	Combat Site	Minmatar Medium NVY-1	100.0%	9.25 AU
NXJ-579	Cosmic Anomaly	Ore Site	Medium Jaspet Deposit	100.0%	4.22 AU
CDQ-280	Cosmic Signature	Combat Site	Minmatar Rendezvous Point	100.0%	3.74 AU`;

const SignalProgressBar = ({ value }: { value: number }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          {/* The indicator bar with the gradient and translation */}
          <div
            className="h-full w-full flex-1 transition-all"
            style={{
              backgroundColor: "#22c55e",
              transform: `translateX(-${100 - (value || 0)}%)`,
            }}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>{value}%</TooltipContent>
    </Tooltip>
  );
};

function generateLinkForName(name: string): string | undefined {
  // Ignore Cosmic Anomalies
  // Generate a link-friendly version of the name
  return name.replace(/\s+/g, "_");
}

const SigName = ({ sig }: { sig: Signature }) => {
  if (!sig.name || sig.name.trim() === "") {
    return (
      <span>-</span>
    );
  }

  if (
    sig.signalStrength < 100 ||
    // Don't link Wormholes or Faction Warfare sites
    sig.subType === "Wormhole" ||
    sig.name.indexOf('ADV-') > -1 || sig.name.indexOf('NVY-') > -1 || sig.name.indexOf('Open Complex') > -1 || sig.name.indexOf('Battlefield') > -1
  ) {
    return (
      <span>
        {sig.name}
      </span>
    );
  }

  return (
    <a href={`https://wiki.eveuniversity.org/${generateLinkForName(sig.name)}`} target="_blank" rel="noopener noreferrer" className=" hover:underline">
      {sig.name || "Unknown"}
    </a>
  );
}

export function SignatureScanner() {
  const [inputText, setInputText] = useState<string>();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [showOnlyUnknown, setShowOnlyUnknown] = useState<boolean>(() => {
    const storedValue = localStorage.getItem(SHOW_ONLY_UNKNOWN_KEY);
    return storedValue ? JSON.parse(storedValue) : false; // Load initial state
  });

  const [knownSignatures, setKnownSignatures] = useState<KnownSignatureStore>(
    {}
  );
  const [favouritedIds, setFavouritedIds] = useState<Set<string>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>();

  useEffect(() => {
    const now = Date.now();
    const storedKnown = localStorage.getItem(KNOWN_SIGNATURES_KEY);
    if (storedKnown) {
      const parsed: KnownSignatureStore = JSON.parse(storedKnown);
      const fresh: KnownSignatureStore = {};
      for (const id in parsed) {
        if (parsed[id]) {
          if (typeof parsed[id] === "number") {
            if (now - parsed[id] < EXPIRATION_MS) fresh[id] = parsed[id];
          } else if (parsed[id].data && typeof parsed[id].timestamp === 'number') {
            if (now - parsed[id].timestamp < EXPIRATION_MS) {
              fresh[id] = parsed[id];
            }
          }
        }
      }
      setKnownSignatures(fresh);
      localStorage.setItem(KNOWN_SIGNATURES_KEY, JSON.stringify(fresh));
    }

    const storedFavourites = localStorage.getItem(FAVOURITED_SIGNATURES_KEY);
    if (storedFavourites)
      setFavouritedIds(new Set(JSON.parse(storedFavourites)));

    const storedIgnored = localStorage.getItem(IGNORED_SIGNATURES_KEY);
    if (storedIgnored) setIgnoredIds(new Set(JSON.parse(storedIgnored)));
  }, []);

  // Effect to save showOnlyUnknown to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      SHOW_ONLY_UNKNOWN_KEY,
      JSON.stringify(showOnlyUnknown)
    );
  }, [showOnlyUnknown]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig?.direction === "descending") {
      setSortConfig(undefined);
      return; // Reset sort if already sorted by this key in descending order
    } else if (
      sortConfig?.key === key &&
      sortConfig?.direction === "ascending"
    ) {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    }
    return sortConfig?.direction === "ascending" ? (
      <span className="ml-1">▲</span>
    ) : (
      <span className="ml-1">▼</span>
    );
  };

  const handleParse = (keepKnownState: boolean = false) => {
    const now = Date.now();
    const existingSigsMap = keepKnownState ? new Map(signatures.map((sig) => [sig.id, sig])) : undefined;
    // Snapshot of known signatures before this parse operation
    const knownSignaturesAtParseStart: KnownSignatureStore = JSON.parse(JSON.stringify(knownSignatures)); // Deep copy
    // This will be the new state for knownSignatures, initialized with current knowns
    const updatedKnownSignatures: KnownSignatureStore = JSON.parse(JSON.stringify(knownSignatures)); // Deep copy
    
    const parsedSigs = (inputText ?? "")
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split("\t");
        if (parts.length < 6) return null;
        const id = parts[0].trim();
        if (!id) return null;

        const signalStrength = parseFloat(parts[4]) || 0;
        const currentParsedData: StoredSignatureData = {
          id,
          type: parts[1].trim(),
          subType: parts[2].trim(),
          name: parts[3].trim(),
          signal: parts[4].trim(),
          distance: parts[5].trim(),
          signalStrength,
        };

        let isKnown: boolean;
        let existingKnownEntry = knownSignaturesAtParseStart[id];

        if (keepKnownState && existingSigsMap && existingSigsMap.size > 0) {
          const oldSig = existingSigsMap!.get(id);
          isKnown = oldSig ? oldSig.isKnown : false; // Preserve state, or false if it's a new line item
        } else {
          isKnown = !!existingKnownEntry;
        }

        if (existingKnownEntry && typeof existingKnownEntry === 'object' && existingKnownEntry.data) {
          // Signature ID was known before this parse
          if (currentParsedData.signalStrength >= existingKnownEntry.data.signalStrength) {
            // New scan is same or better, update stored data and timestamp
            updatedKnownSignatures[id] = { data: currentParsedData, timestamp: now };
            existingKnownEntry = updatedKnownSignatures[id]; // Update reference for later use
          } else {
            // New scan is weaker, keep old data with better signal, just update timestamp
            updatedKnownSignatures[id] = { ...existingKnownEntry, timestamp: now };
            existingKnownEntry = updatedKnownSignatures[id]; // Update reference for later use
          }
        } else {
          // New signature ID, add to known signatures
          updatedKnownSignatures[id] = { data: currentParsedData, timestamp: now };
          existingKnownEntry = updatedKnownSignatures[id]; // Update reference for later use
        }

        if (!keepKnownState && isKnown) {
          return {
            ...currentParsedData,
            ...((existingKnownEntry && typeof existingKnownEntry === 'object' && existingKnownEntry.data) ? existingKnownEntry.data : {}),
            isKnown,
            isFavourited: favouritedIds.has(id),
            isIgnored: ignoredIds.has(id),
          }
        } else {
          return {
            ...currentParsedData,
            isKnown,
            isFavourited: favouritedIds.has(id),
            isIgnored: ignoredIds.has(id),
          };
        }
      })
      .filter((sig): sig is Signature => sig !== null);

    setSignatures(parsedSigs);
    setKnownSignatures(updatedKnownSignatures);
    localStorage.setItem(
      KNOWN_SIGNATURES_KEY,
      JSON.stringify(updatedKnownSignatures)
    );
  };

  const toggleFavourite = (id: string) => {
    const newFavourites = new Set(favouritedIds);
    if (newFavourites.has(id)) newFavourites.delete(id);
    else newFavourites.add(id);

    setFavouritedIds(newFavourites);
    localStorage.setItem(
      FAVOURITED_SIGNATURES_KEY,
      JSON.stringify(Array.from(newFavourites))
    );
    setSignatures((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isFavourited: !s.isFavourited } : s
      )
    );
  };

  const toggleIgnore = (id: string) => {
    const newIgnored = new Set(ignoredIds);
    if (newIgnored.has(id)) newIgnored.delete(id);
    else newIgnored.add(id);

    setIgnoredIds(newIgnored);
    localStorage.setItem(
      IGNORED_SIGNATURES_KEY,
      JSON.stringify(Array.from(newIgnored))
    );
    setSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isIgnored: !s.isIgnored } : s))
    );
  };

  const removeSignature = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    setKnownSignatures((prev) => {
      const newKnown = { ...prev };
      delete newKnown[id];
      localStorage.setItem(KNOWN_SIGNATURES_KEY, JSON.stringify(newKnown));
      return newKnown;
    });
    setFavouritedIds((prev) => {
      const newFavourites = new Set(prev);
      newFavourites.delete(id);
      localStorage.setItem(
        FAVOURITED_SIGNATURES_KEY,
        JSON.stringify(Array.from(newFavourites))
      );
      return newFavourites;
    });
    setIgnoredIds((prev) => {
      const newIgnored = new Set(prev);
      newIgnored.delete(id);
      localStorage.setItem(
        IGNORED_SIGNATURES_KEY,
        JSON.stringify(Array.from(newIgnored))
      );
      return newIgnored;
    });
  };

  const handleReset = () => {
    setInputText("");
    setSignatures([]);
    setKnownSignatures({});
    setFavouritedIds(new Set());
    setIgnoredIds(new Set());
    setShowOnlyUnknown(false); 
    setSortConfig(undefined); 
    localStorage.removeItem(KNOWN_SIGNATURES_KEY);
    localStorage.removeItem(FAVOURITED_SIGNATURES_KEY);
    localStorage.removeItem(IGNORED_SIGNATURES_KEY);
    localStorage.removeItem(SHOW_ONLY_UNKNOWN_KEY);
  };

  const displaySignatures = useMemo(() => {
    const sortableItems = [...signatures];

    if (!!sortConfig && sortConfig.key) {
      const getSortValue = (item: Signature, key: SortKey) => {
        switch (key) {
          case "id":
            return item.id;
          case "status":
            return item.isKnown; // boolean: false (New) < true (Known)
          case "type":
            return item.subType || item.type;
          case "name":
            return item.name;
          case "signal":
            return item.signalStrength;
          case "distance": {
            const distMatch = item.distance.match(/([\d.]+)/);
            return distMatch ? parseFloat(distMatch[1]) : 0;
          }
          default:
            return "";
        }
      };

      sortableItems.sort((a, b) => {
        const valA = getSortValue(a, sortConfig.key!);
        const valB = getSortValue(b, sortConfig.key!);

        let comparison = 0;
        if (typeof valA === "number" && typeof valB === "number") {
          comparison = valA - valB;
        } else if (typeof valA === "boolean" && typeof valB === "boolean") {
          comparison = valA === valB ? 0 : valA ? 1 : -1; // false < true
        } else {
          comparison = String(valA)
            .toLowerCase()
            .localeCompare(String(valB).toLowerCase());
        }
        return sortConfig.direction === "ascending"
          ? comparison
          : comparison * -1;
      });
    }

    return sortableItems.filter(
      (sig) => !showOnlyUnknown || (showOnlyUnknown && !sig.isKnown)
    );
  }, [signatures, showOnlyUnknown, sortConfig]);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-5xl mx-auto my-8">
        <CardHeader>
          <CardTitle>EVE Online Signature Scanner</CardTitle>
          <CardDescription>
            Paste scan results and indicate those that are new, mark favourites, and ignore distractions.<br />Data
            is saved in your browser. Known signatures expire after {EXPIRATION_DAYS} days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste scan results from EVE probe scan here...\r\nFor example:\r\n${sampleData}`}
            rows={8}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleParse(false)}
                disabled={!inputText || inputText === ""}
              >
                Check Signatures
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleParse(true)}
                    variant={"outline"}
                    disabled={(!inputText || inputText === "") || signatures.length === 0}
                  >
                    <span className="sr-only">Refresh</span>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refresh Signatures (ignore current known state)
                </TooltipContent>
              </Tooltip>
              <Button onClick={handleReset} variant={"outline"}>
                Delete All
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-switch"
                checked={showOnlyUnknown}
                onCheckedChange={setShowOnlyUnknown}
              />
              <Label htmlFor="filter-switch">Show Only Unknown</Label>
            </div>
          </div>

          <Table className="text-left">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[100px] cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("id")}
                >
                  <div className="flex items-center">
                    ID {getSortIndicator("id")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status {getSortIndicator("status")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("type")}
                >
                  <div className="flex items-center">
                    Type {getSortIndicator("type")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    Name {getSortIndicator("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[120px] cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("signal")}
                >
                  <div className="flex items-center">
                    Signal {getSortIndicator("signal")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort("distance")}
                >
                  <div className="flex items-center justify-end">
                    Distance {getSortIndicator("distance")}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySignatures.length > 0 ? (
                displaySignatures.map((sig) => (
                  <TableRow
                    key={sig.id}
                    className={cn({
                      "opacity-50 line-through": sig.isIgnored,
                    })}
                  >
                    <TableCell className="font-medium">{sig.id}</TableCell>
                    <TableCell>
                      {sig.isKnown ? (
                        <Badge variant="secondary">Known</Badge>
                      ) : (
                        <Badge variant="default">New</Badge>
                      )}
                    </TableCell>
                    <TableCell>{sig.subType || sig.type}</TableCell>
                    <TableCell><SigName sig={sig} /></TableCell>
                    <TableCell>
                      <SignalProgressBar value={sig.signalStrength} />
                    </TableCell>
                    <TableCell className="text-right">{sig.distance}</TableCell>
                    <TableCell className="flex justify-center items-center space-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavourite(sig.id)}
                          >
                            <Star
                              className={cn("h-4 w-4", {
                                "fill-yellow-400 text-yellow-500":
                                  sig.isFavourited,
                              })}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Favourite</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleIgnore(sig.id)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ignore</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSignature(sig.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {signatures?.length > 0
                      ? "No new signatures."
                      : "No signatures to display."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {knownSignatures && Object.keys(knownSignatures).length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  {displaySignatures.length > 0 ? 
                  `${displaySignatures.length} signature(s) displayed.` : ''} {knownSignatures ? Object.keys(knownSignatures).length : 0} known signature(s) in total.
                </TableCell>
              </TableRow>
            </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <div className="w-full max-w-5xl mx-auto text-left mt-4">
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
              <strong>Check Signatures</strong>: Click the "Process Signatures" button. The tool will parse the data and display it in the table below.
            </li>
            <li>
              <strong>Refresh Signatures</strong>: If you want to refresh the signatures without considering the current known state, click the "Refresh Signatures" button (the circular arrow icon). This will re-parse the input text and update the display.
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
              <strong>Data Persistence</strong>: Your known, favourited, and ignored signatures will be remembered the next time you use the tool in the same browser. Known signatures expire after {EXPIRATION_DAYS} days.
            </li>
            <li>
              <strong>Delete All Data</strong>: Click the "Delete All" button to clear all signatures from the display and remove all data stored in browser local storage for this page.
            </li>
          </ol>
        </div>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Raise issues or provide feedback to Rathin in-game</p>
        </div>
      </div>
    </TooltipProvider>
  );
}
