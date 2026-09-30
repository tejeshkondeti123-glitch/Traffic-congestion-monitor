import { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';

export function SystemLogsDrawer() {
  const { isLogsOpen, setIsLogsOpen, logs, clearLogs, addLog, timeStr } = useSimulation();
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cmdInput, setCmdInput] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return log.message.toLowerCase().includes(q) || log.module.toLowerCase().includes(q);
      }
      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim();
    setCmdInput('');

    if (cmd === 'clear') {
      clearLogs();
    } else if (cmd.startsWith('ping')) {
      addLog('INFO', 'ICMP', `64 bytes from edge-node.songdo.local: icmp_seq=1 ttl=64 time=1.84 ms`);
    } else if (cmd === 'help') {
      addLog('INFO', 'CLI', 'Available commands: help, clear, ping, status, optimize, restart-ai');
    } else if (cmd === 'status') {
      addLog('INFO', 'CLI', 'All 12 edge junction controllers responding. Zero packet loss.');
    } else if (cmd === 'optimize') {
      addLog('WARN', 'AI-OPT', 'Triggered global network phase re-balance across Sector 01-08.');
    } else {
      addLog('INFO', 'OPERATOR', `Command executed: ${cmd}`);
    }
  };

  if (!isLogsOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-outline-variant shadow-2xl transition-all duration-300 flex flex-col h-[380px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-outline-variant bg-surface-container/60">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-lg">terminal</span>
          <span className="font-mono text-xs font-bold tracking-widest text-on-surface uppercase">
            Songdo Real-Time System Telemetry & Event Stream
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/30 animate-pulse">
            LIVE STREAM
          </span>
          <span className="text-[11px] font-mono text-outline">{timeStr}</span>
        </div>

        {/* Level Filters & Controls */}
        <div className="flex items-center gap-2">
          {['ALL', 'INFO', 'WARN', 'CRIT', 'EMERGENCY'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                filterLevel === level
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {level}
            </button>
          ))}

          <div className="h-4 w-px bg-outline-variant mx-1"></div>

          <button
            onClick={clearLogs}
            className="text-[11px] font-mono text-outline hover:text-error px-2 py-0.5 rounded hover:bg-surface-container-high transition-colors"
            title="Clear terminal buffer"
          >
            Clear
          </button>

          <button
            onClick={() => setIsLogsOpen(false)}
            className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition-colors"
            title="Close terminal"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex items-center gap-3 px-6 py-2 bg-surface-container-low/40 border-b border-outline-variant/50 text-xs font-mono">
        <span className="text-outline">FILTER:</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by subsystem or regex..."
          className="bg-surface-container-high/80 border border-outline-variant/60 rounded px-2.5 py-1 text-on-surface text-xs font-mono w-64 focus:outline-none focus:border-primary"
        />
        <span className="text-outline ml-auto text-[11px]">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Log Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[12px] selection:bg-primary/20">
        {filteredLogs.length === 0 ? (
          <div className="text-outline text-center py-8">No matching telemetry logs in active buffer.</div>
        ) : (
          filteredLogs.map(log => {
            const badgeColor =
              log.level === 'EMERGENCY'
                ? 'bg-error text-on-error font-bold'
                : log.level === 'CRIT'
                ? 'bg-error-container text-error'
                : log.level === 'WARN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-primary/10 text-primary border border-primary/20';

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 py-1 px-2 rounded hover:bg-surface-container-high/40 transition-colors"
              >
                <span className="text-outline shrink-0">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 ${badgeColor}`}>
                  {log.level}
                </span>
                <span className="text-secondary shrink-0 font-semibold">[{log.module}]</span>
                <span className="text-on-surface flex-1 break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={handleCommandSubmit}
        className="flex items-center gap-2 px-6 py-2 border-t border-outline-variant bg-surface-container-lowest"
      >
        <span className="font-mono text-primary text-xs font-bold">operator@songdo-core:~$</span>
        <input
          type="text"
          value={cmdInput}
          onChange={e => setCmdInput(e.target.value)}
          placeholder="Type command (e.g., 'ping', 'status', 'optimize', 'clear', 'help')..."
          className="flex-1 bg-transparent text-on-surface text-xs font-mono focus:outline-none placeholder:text-outline/60"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-[11px] font-mono transition-colors"
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
}
