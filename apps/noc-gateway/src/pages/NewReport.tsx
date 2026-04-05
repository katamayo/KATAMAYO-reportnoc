import { useState } from 'react';
import { useSession } from '../lib/auth-client';
import { reportApi } from '../lib/api';

export default function NewReport() {
  const { data: sessionData } = useSession();
  const adminName = sessionData?.user?.name || 'Unknown Operator';

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDisplay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const defaultTimestamp = `${todayStr}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const [shift, setShift] = useState(1);
  const [troubleshooting, setTroubleshooting] = useState('');
  const [aktivasi, setAktivasi] = useState('');
  const [replacementOnu, setReplacementOnu] = useState('');
  const [checkOnu, setCheckOnu] = useState('');
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState(defaultTimestamp);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [whatsappText, setWhatsappText] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      const dateOnly = reportDate.split('T')[0];
      const report = await reportApi.create({
        reportDate: dateOnly,
        shift,
        troubleshooting: parseInt(troubleshooting) || 0,
        aktivasi: parseInt(aktivasi) || 0,
        replacementOnu: parseInt(replacementOnu) || 0,
        checkOnu: parseInt(checkOnu) || 0,
        notes: notes.trim() || null,
      });

      // Copy WA summary to clipboard
      if (report.whatsappSummary) {
        await navigator.clipboard.writeText(report.whatsappSummary);
        setWhatsappText(report.whatsappSummary);
      }

      setSuccess(true);

      // Reset form
      setTroubleshooting('');
      setAktivasi('');
      setReplacementOnu('');
      setCheckOnu('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1 block">Data Entry Portal</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-background">New Daily Report</h1>
          <p className="text-outline text-sm mt-2 max-w-md">Document the daily operational metrics and activity logs for terminal nodes and infrastructure maintenance.</p>
        </div>
        <div className="flex gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-bold tracking-tighter">Current Session</span>
            <span className="text-sm font-medium">{todayDisplay}</span>
          </div>
          <div className="w-px h-8 bg-outline-variant/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-bold tracking-tighter">Auth Operator</span>
            <span className="text-sm font-medium">{adminName}</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-tertiary mb-1">Report saved & WhatsApp summary copied to clipboard!</p>
            {whatsappText && (
              <pre className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg mt-2 whitespace-pre-wrap font-mono border border-outline-variant/10 max-h-40 overflow-y-auto">{whatsappText}</pre>
            )}
          </div>
          <button onClick={() => setSuccess(false)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-xl">error</span>
          <p className="text-sm text-error font-medium flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Bento Form Layout */}
      <form className="grid grid-cols-1 md:grid-cols-12 gap-6" onSubmit={e => e.preventDefault()}>
        {/* Operator Info */}
        <div className="md:col-span-12 lg:col-span-4 bg-surface-container-high p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">fingerprint</span>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Identification</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-outline uppercase font-bold mb-1.5" htmlFor="operatorName">Operator Name</label>
              <div className="w-full bg-surface-container-lowest text-on-surface-variant px-4 py-3 rounded-lg text-sm font-medium border border-outline-variant/10">
                {adminName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] text-outline uppercase font-bold mb-1.5">Active Shift</label>
              <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/10">
                {[1, 2, 3].map((s) => (
                  <label key={s} className="relative flex items-center justify-center">
                    <input 
                      checked={shift === s} 
                      className="peer sr-only" 
                      name="shift" 
                      type="radio" 
                      value={s} 
                      onChange={() => setShift(s)} 
                    />
                    <span className="w-full text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer transition-all text-outline hover:text-on-surface peer-checked:bg-primary/20 peer-checked:text-primary">
                      Shift {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-outline uppercase font-bold mb-1.5" htmlFor="reportTimestamp">Report Timestamp</label>
              <input 
                id="reportTimestamp"
                type="datetime-local" 
                className="w-full bg-surface-container-lowest text-on-surface-variant px-4 py-3 rounded-lg text-sm font-medium border border-outline-variant/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none [color-scheme:light] dark:[color-scheme:dark]" 
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div className="pt-4 mt-4 border-t border-outline-variant/10">
              <p className="text-[10px] text-outline leading-relaxed italic">Identity verified via system login. Fields are locked to preserve audit trail integrity.</p>
            </div>
          </div>
        </div>

        {/* Main Activity Metrics */}
        <div className="md:col-span-12 lg:col-span-8 bg-surface-container-high p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Operation Metrics</h3>
            </div>
            { (troubleshooting || aktivasi || replacementOnu || checkOnu) && (
              <span className="text-[10px] font-medium text-tertiary px-2 py-1 bg-tertiary-container/10 rounded">Input Active</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Troubleshooting */}
            <div className="space-y-2">
              <label className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                <span>Troubleshooting</span>
                <span className="text-primary">Tickets</span>
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:border-primary/50 focus:ring-primary/40 rounded-lg py-3 px-4 text-sm transition-all" 
                  placeholder="0" 
                  type="text" 
                  inputMode="numeric"
                  value={troubleshooting}
                  onChange={(e) => setTroubleshooting(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {troubleshooting && (
                    <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-outline italic">Resolved/Active incident reports.</p>
            </div>

            {/* Aktivasi */}
            <div className="space-y-2">
              <label className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                <span>Aktivasi Perangkat Baru</span>
                <span className="text-primary">Units</span>
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:border-primary/50 focus:ring-primary/40 rounded-lg py-3 px-4 text-sm transition-all" 
                  placeholder="0" 
                  type="text" 
                  inputMode="numeric"
                  value={aktivasi}
                  onChange={(e) => setAktivasi(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {aktivasi && (
                    <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-outline italic">New terminal node provisionings.</p>
            </div>

            {/* Replacement ONU */}
            <div className="space-y-2">
              <label className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                <span>Replacement ONU</span>
                <span className="text-primary">Units</span>
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:border-primary/50 focus:ring-primary/40 rounded-lg py-3 px-4 text-sm transition-all" 
                  placeholder="0" 
                  type="text" 
                  inputMode="numeric"
                  value={replacementOnu}
                  onChange={(e) => setReplacementOnu(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {replacementOnu && (
                    <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-outline italic">Hardware failure & unit replacements.</p>
            </div>

            {/* Check ONU */}
            <div className="space-y-2">
              <label className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                <span>Check ONU</span>
                <span className="text-primary">Sites</span>
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:border-primary/50 focus:ring-primary/40 rounded-lg py-3 px-4 text-sm transition-all" 
                  placeholder="0" 
                  type="text" 
                  inputMode="numeric"
                  value={checkOnu}
                  onChange={(e) => setCheckOnu(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {checkOnu ? (
                    <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-outline-variant text-lg">pending</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-outline italic">Routine signal &amp; power checks at specific sites.</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 space-y-2">
            <label className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
              <span>Notes</span>
              <span className="text-outline font-normal normal-case">Optional</span>
            </label>
            <textarea
              className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary/40 rounded-lg py-3 px-4 text-sm transition-all resize-none"
              placeholder="Additional observations, fiber cuts, outages..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Global Actions Bar */}
        <div className="md:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface-container-high rounded-xl">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-outline text-2xl">info</span>
            <div className="text-[10px] text-outline uppercase tracking-wider max-w-xs leading-relaxed">
              Data is saved to the database and pushed to the global history. 'Save &amp; Copy' prepares a WhatsApp-ready summary on your clipboard.
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              className="flex-1 sm:flex-none px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all rounded-lg" 
              type="button"
              onClick={() => {
                setTroubleshooting(''); setAktivasi(''); setReplacementOnu(''); setCheckOnu(''); setNotes('');
                setSuccess(false); setError('');
              }}
            >
              Cancel
            </button>
            <button 
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">send</span>
              )}
              {loading ? 'Saving...' : 'Save & Copy to WA'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
