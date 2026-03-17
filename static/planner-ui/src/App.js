import React, { useEffect, useRef, useState } from 'react';
import { invoke, requestJira, view, router } from '@forge/bridge';

const ROWS = [
    { key: 'Highest', label: 'Highest' },
    { key: 'High',    label: 'High' },
    { key: 'Medium',  label: 'Medium' },
    { key: 'Low',     label: 'Low' },
    { key: 'Lowest',  label: 'Lowest' },
];

const VALID_PRIORITY_KEYS = new Set(ROWS.map(r => r.key));

const BACKLOG_COLUMN = { id: 'backlog', name: 'Backlog', state: 'backlog' };

function getPriorityRow(priority) {
    if (priority && VALID_PRIORITY_KEYS.has(priority)) return priority;
    return 'Lowest';
}

function buildGridData(epics, columns) {
    const grid = {};
    for (const row of ROWS) {
        grid[row.key] = {};
        for (const col of columns) {
            grid[row.key][col.id] = [];
        }
    }
    for (const epic of epics) {
        const row = getPriorityRow(epic.priority);
        grid[row][BACKLOG_COLUMN.id].push(epic);
    }
    return grid;
}

async function fetchChildIssues(epicKey) {
    const jql = encodeURIComponent(
        `"Epic Link" = ${epicKey} AND statusCategory != Done ORDER BY created DESC`
    );
    const res = await requestJira(
        `/rest/api/3/search/jql?jql=${jql}&fields=summary&maxResults=50`
    );
    const data = await res.json();
    return (data.issues ?? []).map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
    }));
}

// --- Styles ---

const gridStyle = (colCount) => ({
    display: 'grid',
    gridTemplateColumns: `120px repeat(${colCount}, minmax(140px, 1fr))`,
    border: '1px solid #ccc',
    borderRadius: 4,
    overflowX: 'auto',
});

const headerCellStyle = (isActive) => ({
    padding: '8px 12px',
    fontWeight: 'bold',
    background: isActive ? '#e6f0ff' : '#f4f5f7',
    borderBottom: '1px solid #ccc',
    borderRight: '1px solid #eee',
    textAlign: 'center',
    fontSize: 13,
    whiteSpace: 'nowrap',
});

const rowLabelStyle = {
    padding: '8px 12px',
    fontWeight: 'bold',
    background: '#f4f5f7',
    borderBottom: '1px solid #eee',
    borderRight: '1px solid #ccc',
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 10,
    fontSize: 13,
};

const cellStyle = {
    padding: 8,
    borderBottom: '1px solid #eee',
    borderRight: '1px solid #eee',
    minHeight: 80,
};

const cardStyle = {
    background: '#e8f0fe',
    border: '1px solid #b3c6f7',
    borderRadius: 3,
    padding: '4px 8px',
    marginBottom: 4,
    fontSize: 13,
};

const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
};

const cardKeyStyle = {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#555',
};

const childIssueStyle = {
    marginTop: 6,
    paddingTop: 6,
    borderTop: '1px solid #b3c6f7',
};

const childItemStyle = {
    fontSize: 12,
    padding: '2px 0',
    color: '#333',
};

const childKeyStyle = {
    fontWeight: 'bold',
    color: '#555',
    marginRight: 4,
};

// --- Components ---

function EpicCard({ epic }) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function toggle() {
        if (!expanded && children === null) {
            setLoading(true);
            fetchChildIssues(epic.key)
                .then(issues => {
                    setChildren(issues);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message ?? 'Failed to load');
                    setLoading(false);
                });
        }
        setExpanded(prev => !prev);
    }

    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle} onClick={toggle}>
                <span style={cardKeyStyle}>{epic.key}</span>
                <span style={{ fontSize: 11, color: '#555' }}>{expanded ? '▲' : '▼'}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{epic.summary}</div>

            {expanded && (
                <div style={childIssueStyle}>
                    {loading && <div style={{ fontSize: 12, color: '#888' }}>Loading...</div>}
                    {error && <div style={{ fontSize: 12, color: 'red' }}>{error}</div>}
                    {children && children.length === 0 && (
                        <div style={{ fontSize: 12, color: '#888' }}>No open issues</div>
                    )}
                    {children && children.map(issue => (
                        <div key={issue.key} style={childItemStyle}>
                            <span style={childKeyStyle}>{issue.key}</span>
                            {issue.summary}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PlanningGrid({ epics, sprints }) {
    const columns = [...sprints, BACKLOG_COLUMN];
    const gridData = buildGridData(epics, columns);

    return (
        <div style={gridStyle(columns.length)}>
            <div style={headerCellStyle(false)} />
            {columns.map(col => (
                <div key={col.id} style={headerCellStyle(col.state === 'active')}>
                    {col.name}
                    {col.state === 'active' && (
                        <span style={{ display: 'block', fontSize: 10, color: '#0052cc', fontWeight: 'normal' }}>
                            active
                        </span>
                    )}
                </div>
            ))}

            {ROWS.map(row => (
                <React.Fragment key={row.key}>
                    <div style={rowLabelStyle}>{row.label}</div>
                    {columns.map(col => (
                        <div key={col.id} style={cellStyle}>
                            {gridData[row.key][col.id].map(epic => (
                                <EpicCard key={epic.key} epic={epic} />
                            ))}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
}

// Try to find the best matching filter for a board by looking for the board's
// project key in each filter's JQL. Falls back to the first filter if no match.
function findMatchingFilter(filters, board) {
    if (!board?.projectKey || !filters?.length) return filters?.[0]?.id ?? null;
    const key = board.projectKey.toLowerCase();
    const match = filters.find(f => f.jql.toLowerCase().includes(key));
    return match ? match.id : filters[0].id;
}

// Cache the context — used for both reading the current board ID and navigating.
let appContext = null;
async function getContext() {
    if (!appContext) appContext = await view.getContext();
    return appContext;
}

// Read the board ID from the URL path.
// extension.location is the full app URL, e.g. .../r/super-planner or .../r/super-planner/37
async function getBoardIdFromPath() {
    const context = await getContext();
    const location = context?.extension?.location ?? '';
    const match = location.match(/\/super-planner\/(\d+)/);
    return match ? Number(match[1]) : null;
}

// Navigate to the app URL for a specific board, updating the browser address bar.
async function navigateToBoard(boardId) {
    const context = await getContext();
    const location = context?.extension?.location ?? '';
    // Strip any existing board ID suffix, then append the new one
    const base = location.replace(/\/super-planner(\/\d+)?$/, '/super-planner');
    router.navigate(`${base}/${boardId}`);
}

function App() {
    const [boards, setBoards] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [filters, setFilters] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [sprints, setSprints] = useState(null);
    const [epics, setEpics] = useState(null);
    const [error, setError] = useState(null);
    // Track whether the current board selection came from the URL (initial load)
    // or from the user. Only navigate on user-initiated changes to avoid reload loops.
    const isInitialBoardSelection = useRef(true);

    // Load boards and filters in parallel on mount, then restore board from URL path
    useEffect(() => {
        Promise.all([invoke('getBoards'), invoke('getFilters'), getBoardIdFromPath()])
            .then(([boardData, filterData, pathBoardId]) => {
                setBoards(boardData);
                setFilters(filterData);
                // Prefer the board ID from the URL path, fall back to first board
                const board = (pathBoardId && boardData.find(b => b.id === pathBoardId))
                    ?? boardData[0]
                    ?? null;
                if (board) setSelectedBoard(board.id);
                setSelectedFilter(findMatchingFilter(filterData, board));
            })
            .catch(err => setError(err.message ?? 'Failed to load data'));
    }, []);

    // When board changes, update the browser URL, re-fetch sprints, and auto-select filter
    useEffect(() => {
        if (!selectedBoard || !boards) return;
        // Skip navigation on the initial load — the URL is already correct
        if (isInitialBoardSelection.current) {
            isInitialBoardSelection.current = false;
        } else {
            navigateToBoard(selectedBoard);
        }
        setSprints(null);
        invoke('getSprints', { boardId: selectedBoard })
            .then(setSprints)
            .catch(err => setError(err.message ?? 'Failed to load sprints'));
        const board = boards.find(b => b.id === selectedBoard || b.id === Number(selectedBoard));
        setSelectedFilter(findMatchingFilter(filters, board));
    }, [selectedBoard]);

    // Re-fetch epics when the selected filter changes
    useEffect(() => {
        if (!selectedFilter) return;
        setEpics(null);
        invoke('getEpics', { filterId: selectedFilter })
            .then(setEpics)
            .catch(err => setError(err.message ?? 'Failed to load epics'));
    }, [selectedFilter]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="board-select">Board: </label>
                <select
                    id="board-select"
                    value={selectedBoard ?? ''}
                    onChange={e => setSelectedBoard(e.target.value)}
                    disabled={!boards}
                >
                    {boards
                        ? boards.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                          ))
                        : <option>Loading...</option>
                    }
                </select>
            </div>

            {!sprints || !epics
                ? <div>Loading...</div>
                : <PlanningGrid epics={epics} sprints={sprints} />
            }
        </div>
    );
}

export default App;
