import { useState, useEffect } from 'react'
import axios from 'axios'
import { Satellite, Activity, Trash2, Plus, AlertCircle, Loader2 } from 'lucide-react'

const API_BASE = "http://localhost:8000/telemetry"

function App() {
  const [telemetry, setTelemetry] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"timestamp" | "altitude" | "velocity">("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Form State (State Management requirement)
  const [formData, setFormData] = useState({
    satelliteId: '',
    altitude: 0,
    velocity: 0,
    status: 'healthy'
  })

  const sortedTelemetry = [...telemetry].sort((a: any, b: any) => {
    let valA = a[sortField]
    let valB = b[sortField]

    if (sortField === "timestamp") {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1
    if (valA > valB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const fetchTelemetry = async () => {
    setLoading(true)
    try {
      const response = await axios.get(API_BASE)
      setTelemetry(response.data.data)  // no sorting here
      setError(null)
    } catch (err) {
      setError("Ground Station Offline: Unable to sync with fleet.")
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: "timestamp" | "altitude" | "velocity") => {
    if (field === sortField) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // DELETE Implementation
  const deleteEntry = async (id: string) => {
    if (!window.confirm("Confirm deletion of telemetry record?")) return
    setLoading(true)
    try {
      await axios.delete(`${API_BASE}/${id}`)
      await fetchTelemetry()
    } catch (err) {
      alert("Failed to delete record.")
    } finally {
      setLoading(false)
    }
  }

  // POST Implementation with Validation
  const handleAddTelemetry = async (e: React.FormEvent) => {
    e.preventDefault()
    // Requirement: Input Validation
    if (formData.altitude <= 0 || formData.velocity <= 0) {
      return alert("Altitude and velocity must be positive.")
    }
    
    if (!formData.satelliteId) {
      return alert("Satellite ID is required.")
    }

    try {
      await axios.post(API_BASE, {
        ...formData,
        timestamp: new Date().toISOString() // Ensure ISO 8601
      })
      setFormData({ satelliteId: '', altitude: 0, velocity: 0, status: 'healthy' })
      fetchTelemetry()
    } catch (err) {
      alert("Transmission failed. Check backend link.")
    }
  }

  useEffect(() => { fetchTelemetry() }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Satellite className="text-blue-500" /> MISSION CONTROL
          </h1>
          <p className="text-slate-500 text-sm font-mono mt-1">SATELLITE GROUND SEGMENT // LIVE MONITOR</p>
        </div>
        <button onClick={fetchTelemetry} className="bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-md transition-all flex items-center gap-2 border border-slate-300 font-bold">
          <Activity size={16} /> REFRESH
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR: TELEMETRY INJECTION FORM */}
        <aside className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" /> INJECT PACKET
            </h2>
            <form onSubmit={handleAddTelemetry} className="space-y-4">
              <div>
                <label htmlFor="sat-id" className="text-xs text-slate-500 block mb-1">VEHICLE ID</label>
                <input 
                  id="sat-id"
                  type="text" 
                  placeholder="e.g. VOYAGER-1" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                  value={formData.satelliteId} 
                  onChange={(e) => setFormData({...formData, satelliteId: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="altitude-input" className="text-xs text-slate-500 block mb-1">ALTITUDE (KM)</label>
                  <input 
                    id="altitude-input"
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" 
                    value={formData.altitude} 
                    onChange={(e) => setFormData({...formData, altitude: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label htmlFor="velocity-input" className="text-xs text-slate-500 block mb-1">VELOCITY (KM/S)</label>
                  <input 
                    id="velocity-input"
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" 
                    value={formData.velocity} 
                    onChange={(e) => setFormData({...formData, velocity: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status-select" className="text-xs text-slate-500 block mb-1">HEALTH STATUS</label>
                <select 
                  id="status-select"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="healthy">HEALTHY</option>
                  <option value="warning">WARNING</option>
                  <option value="critical">CRITICAL</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-black py-2 rounded font-bold text-sm mt-2 transition-colors uppercase tracking-widest">
                TRANSMIT PACKET
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN DASHBOARD */}
        <main className="lg:col-span-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="text-slate-500 font-mono text-xs">SYNCHRONIZING BUFFER...</span>
              </div>
            ) : error ? (
              <div className="p-24 text-center">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
                <p className="text-red-400 font-bold">{error}</p>
                <button onClick={fetchTelemetry} className="mt-4 text-blue-400 underline text-sm">RETRY LINK</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 text-[10px] tracking-widest uppercase border-b border-slate-800">
                      <th className="p-4">VEHICLE</th>
                      <th
                        className="p-4 text-right cursor-pointer hover:text-white"
                        onClick={() => handleSort("altitude")}
                      >
                        ALTITUDE {sortField === "altitude" && (sortDirection === "asc" ? "▲" : "▼")}
                      </th>
                      <th
                        className="p-4 text-right cursor-pointer hover:text-white"
                        onClick={() => handleSort("velocity")}
                      >
                        VELOCITY {sortField === "velocity" && (sortDirection === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="p-4">STATUS</th>
                      <th
                        className="p-4 cursor-pointer hover:text-white"
                        onClick={() => handleSort("timestamp")}
                      >
                        TIMESTAMP {sortField === "timestamp" && (sortDirection === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="p-4 text-center">CMD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sortedTelemetry.map((t) => (
                      <tr key={t.id} className="hover:bg-blue-900/10 transition-colors">
                        <td className="p-4 font-mono text-blue-400 text-sm">{t.satelliteId}</td>
                        <td className="p-4 text-right font-mono text-sm">{t.altitude.toLocaleString()} km</td>
                        <td className="p-4 text-right font-mono text-sm">{t.velocity.toLocaleString()} km/s</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.status === 'healthy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            t.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-xs font-mono">
                          {new Date(t.timestamp).toISOString()}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => deleteEntry(t.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {telemetry.length === 0 && <p className="p-12 text-center text-slate-600 text-sm italic">TELEMETRY BUFFER EMPTY</p>}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
