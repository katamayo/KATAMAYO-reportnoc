import { useState, useEffect } from 'react';
import { reportApi, type PaginatedReports } from '../lib/api';

export default function History() {
  const [data, setData] = useState<PaginatedReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Quick summary stats
  const [totalStats, setTotalStats] = useState({ total: 0, maintenance: 0, critical: 0, avgResolv: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    reportApi.list({ page, limit })
      .then((result) => {
        if (!cancelled) {
          setData(result);

          // Compute stats from current page (simplified — ideally from a stats endpoint)
          const total = result.pagination.total;
          let maintenance = 0, critical = 0, allMetrics = 0;
          result.data.forEach((r) => {
            maintenance += r.troubleshooting + r.replacementOnu + r.checkOnu;
            critical += r.replacementOnu;
            allMetrics += r.troubleshooting + r.aktivasi + r.replacementOnu + r.checkOnu;
          });
          const avgResolv = allMetrics > 0 ? Math.round((maintenance / allMetrics) * 100) : 0;
          setTotalStats({ total, maintenance, critical, avgResolv });
        }
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page]);

  const handleCopy = async (report: PaginatedReports['data'][0]) => {
    if (report.whatsappSummary) {
      await navigator.clipboard.writeText(report.whatsappSummary);
      alert('WhatsApp summary copied to clipboard!');
    }
  };

  const reports = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col h-full space-y-6">
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-background">Report History</h1>
          <p className="text-on-surface-variant text-sm mt-1">Audit log of system-wide NOC observational metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-primary/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-high p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">analytics</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Total Reports</span>
          <span className="text-3xl font-extrabold text-on-background">{totalStats.total.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-high p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-tertiary">task_alt</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Maintenance Done</span>
          <span className="text-3xl font-extrabold text-tertiary">{totalStats.maintenance.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-high p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-error">warning</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Critical Alerts</span>
          <span className="text-3xl font-extrabold text-error">{totalStats.critical.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-high p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">speed</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Avg Daily Resolv.</span>
          <span className="text-3xl font-extrabold text-primary">{totalStats.avgResolv}%</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <span className="ml-4 text-on-surface-variant text-sm">Loading reports...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-outline text-5xl mb-4 block">receipt_long</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">No Reports Yet</h3>
          <p className="text-sm text-outline max-w-md mx-auto">
            Start by creating a <a href="/new-report" className="text-primary font-bold hover:underline">New Report</a> to see your history here.
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && reports.length > 0 && (
        <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col shadow-2xl min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low z-10 border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline">Date</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline">Operator</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline text-center">Shift</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline text-center">Activation</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline text-center">Troubleshoot</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline">ONU Maintenance</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-outline text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {reports.map((item) => {
                  let statusLabel = 'Stable';
                  let statusColor = 'bg-tertiary';
                  let statusText = 'text-tertiary';
                  let width = '25%';
                  
                  if (item.replacementOnu > 5) {
                    statusLabel = 'Critical';
                    statusColor = 'bg-error';
                    statusText = 'text-error';
                    width = '90%';
                  } else if (item.troubleshooting > 10) {
                    statusLabel = 'Warning';
                    statusColor = 'bg-yellow-500';
                    statusText = 'text-yellow-500';
                    width = '75%';
                  }

                  const displayDate = new Date(item.reportDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  });

                  const initials = (item.operatorName || 'UO').substring(0, 2).toUpperCase();

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-high/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-sm text-on-background">
                        {displayDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-primary">{initials}</div>
                          <span className="text-sm">{item.operatorName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-surface-container-highest text-on-surface px-2 py-1 rounded text-xs font-bold">S{item.shift}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-surface-container-highest text-primary px-2 py-1 rounded text-xs font-bold">{item.aktivasi}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-surface-container-highest text-secondary px-2 py-1 rounded text-xs font-bold">{item.troubleshooting}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className={`h-full ${statusColor}`} style={{ width }}></div>
                          </div>
                          <span className={`text-[10px] font-bold ${statusText}`}>{statusLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleCopy(item)}
                            className="p-1.5 hover:bg-surface-container-highest text-outline hover:text-primary rounded" 
                            title="Copy WA Summary"
                          >
                            <span className="material-symbols-outlined text-lg">content_copy</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="px-6 py-4 bg-surface-container-high/30 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-xs text-outline font-medium uppercase tracking-widest">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
              </span>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 hover:bg-surface-container-highest rounded text-outline disabled:opacity-30" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest'}`}
                  >
                    {p}
                  </button>
                ))}
                {pagination.totalPages > 5 && <span className="mx-1 text-outline">...</span>}
                {pagination.totalPages > 5 && (
                  <button 
                    onClick={() => setPage(pagination.totalPages)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${page === pagination.totalPages ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest'}`}
                  >
                    {pagination.totalPages}
                  </button>
                )}
                <button 
                  className="p-1 hover:bg-surface-container-highest rounded text-outline disabled:opacity-30"
                  disabled={page >= (pagination?.totalPages || 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
