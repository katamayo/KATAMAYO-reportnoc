import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportApi, type ReportStats } from '../lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high/90 backdrop-blur-md p-4 rounded-xl border border-outline-variant/20 shadow-2xl z-50">
        <p className="text-on-surface font-extrabold text-[10px] uppercase tracking-widest mb-3 border-b border-outline-variant/20 pb-2">{`DATE : ${label}`}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{entry.name}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Component for individual metric charts
const MetricChart = ({ dataKey, color, title, monthData }: { dataKey: string, color: string, title: string, monthData: any[] }) => {
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  const data = monthData.filter((item) => {
    const day = parseInt(item.name);
    if (selectedWeek === 'Week 1') return day >= 1 && day <= 7;
    if (selectedWeek === 'Week 2') return day >= 8 && day <= 14;
    if (selectedWeek === 'Week 3') return day >= 15 && day <= 21;
    if (selectedWeek === 'Week 4') return day >= 22;
    return true;
  });

  return (
    <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10 flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface truncate">{title}</h3>
        </div>
        <div className="flex bg-surface-container-low rounded-lg p-1.5 px-3 border border-outline-variant/10 shrink-0">
          <select 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-on-surface outline-none cursor-pointer"
          >
            <option className="bg-surface text-on-surface" value="Week 1">Week 1 (1-7)</option>
            <option className="bg-surface text-on-surface" value="Week 2">Week 2 (8-14)</option>
            <option className="bg-surface text-on-surface" value="Week 3">Week 3 (15-21)</option>
            <option className="bg-surface text-on-surface" value="Week 4">Week 4 (22+)</option>
          </select>
        </div>
      </div>
      <div className="h-48 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 9, fontWeight: 'bold' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 9 }} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--outline-variant)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: 'var(--surface-container-high)', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Available months for the selector
const getAvailableMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }
  return months;
};

export default function Dashboard() {
  const availableMonths = getAvailableMonths();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0].value);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    reportApi.getStats(selectedMonth)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load stats');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedMonth]);

  // Transform API data to chart format
  const chartData = stats?.dailyBreakdown.map((day) => ({
    name: String(new Date(day.date).getDate()),
    Aktivasi: day.aktivasi,
    Troubleshooting: day.troubleshooting,
    'Replacement ONU': day.replacementOnu,
    'Check ONU': day.checkOnu,
  })) || [];

  const totalAktivasi = stats?.totals.aktivasi || 0;
  const totalTb = stats?.totals.troubleshooting || 0;
  const totalRepl = stats?.totals.replacementOnu || 0;
  const totalCheck = stats?.totals.checkOnu || 0;
  const totalMonthlyReports = totalAktivasi + totalTb + totalRepl + totalCheck;
  const avgDailyReports = stats?.avgDailyReports || 0;

  // Find the label for the currently selected month

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1">Network Overview</h1>
          <p className="text-outline text-sm">Real-time observational telemetry for regional nodes.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant/10 shadow-sm">
          <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse shadow-[0_0_8px_var(--tertiary)]"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-tertiary">System Live</span>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <span className="ml-4 text-on-surface-variant text-sm">Loading dashboard data...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 text-center">
          <span className="material-symbols-outlined text-outline text-5xl mb-4 block">monitoring</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">No Data Available</h3>
          <p className="text-sm text-outline max-w-md mx-auto">
            No reports have been submitted yet. Start by creating a <a href="/new-report" className="text-primary font-bold hover:underline">New Report</a> to see data here.
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Report Volumes Section */}
          <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-outline uppercase tracking-widest">Report Volumes Summary</h3>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-3 py-2 outline-none focus:border-primary shadow-sm cursor-pointer transition-all"
              >
                {availableMonths.map(month => (
                  <option className="bg-surface text-on-surface" key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border-l-4 border-outline-variant shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Avg Daily Reports</span>
                <span className="text-xl font-extrabold text-on-surface mt-1">{avgDailyReports}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border-l-4 border-outline shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Monthly Reports</span>
                <span className="text-xl font-extrabold text-on-surface mt-1">{totalMonthlyReports.toLocaleString()}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border border-outline-variant/10 shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-sm"></span> Aktivasi
                </span>
                <span className="text-lg font-extrabold text-primary mt-1">{totalAktivasi.toLocaleString()}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border border-outline-variant/10 shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary shadow-sm"></span> Troubleshoot
                </span>
                <span className="text-lg font-extrabold text-tertiary mt-1">{totalTb.toLocaleString()}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border border-outline-variant/10 shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error shadow-sm"></span> Replace ONU
                </span>
                <span className="text-lg font-extrabold text-error mt-1">{totalRepl.toLocaleString()}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between border border-outline-variant/10 shadow-md dark:shadow-black/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-sm"></span> Check ONU
                </span>
                <span className="text-lg font-extrabold text-yellow-500 mt-1">{totalCheck.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Trend Visualization */}
          <div className="bg-surface-container-high p-6 md:p-8 rounded-xl mb-8 border border-outline-variant/10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface tracking-tight">Combined Activity Trends</h3>
                <p className="text-xs text-outline uppercase tracking-wider">Monthly Performance Metrics Overview</p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="hidden sm:flex items-center gap-4 border-l border-outline-variant/20 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary shadow-sm"></span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Aktivasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-tertiary shadow-sm"></span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Troubleshooting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error shadow-sm"></span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Replacement ONU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Check ONU</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-72 w-full bg-surface-container-lowest rounded-lg p-2 md:p-6 border border-outline-variant/10">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--outline-variant)" vertical={false} strokeOpacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 10, fontWeight: 'bold' }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 10 }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--outline-variant)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line type="monotone" dataKey="Aktivasi" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Troubleshooting" stroke="var(--tertiary)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Replacement ONU" stroke="var(--error)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Check ONU" stroke="#eab308" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-outline text-sm">
                  No report data for this month yet.
                </div>
              )}
            </div>
          </div>

          {/* Individual Variable Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart monthData={chartData} dataKey="Aktivasi" color="var(--primary)" title="Aktivasi Perangkat" />
              <MetricChart monthData={chartData} dataKey="Troubleshooting" color="var(--tertiary)" title="Troubleshooting" />
              <MetricChart monthData={chartData} dataKey="Replacement ONU" color="var(--error)" title="Replacement ONU" />
              <MetricChart monthData={chartData} dataKey="Check ONU" color="#eab308" title="Check ONU" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
