import React, { useState } from 'react';
import { Microscope, FileText, Zap, Clock } from 'lucide-react';

export const ScannerCalculator = () => {
  const [slidesPerDay, setSlidesPerDay] = useState(1000);
  const [scannerSpeedPerHour, setScannerSpeedPerHour] = useState(50);
  const [outputCycleHours, setOutputCycleHours] = useState(12);
  const [scanningDays, setScanningDays] = useState(22);

  const monthlySlides = slidesPerDay * scanningDays;

  // Logic for the vote and metrics based on image
  let redundancy = 'none';
  let speed = 'very slow';
  let vote = 'not recommended';
  const scannersNeeded = Math.ceil(monthlySlides / scanningDays / outputCycleHours / scannerSpeedPerHour);

  if (outputCycleHours >= 24) {
    redundancy = 'none';
    speed = 'very slow';
    vote = 'not recommended';
  } else if (outputCycleHours >= 18) {
    redundancy = 'good';
    speed = 'slow';
    vote = 'Acceptable'; // Using acceptable redundancy
  } else if (outputCycleHours >= 12) {
    redundancy = 'goldilocks';
    speed = 'goldilocks';
    vote = 'Goldilocks';
  } else if (outputCycleHours >= 6) {
    redundancy = 'very high';
    speed = 'fast';
    vote = 'Business Hour king';
  } else {
    redundancy = 'over kill';
    speed = 'very fast';
    vote = 'Fast & Expensive';
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Microscope className="w-8 h-8 text-blue-600" />
          Scanner Capacity Calculator
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Slides Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex flex-row items-center justify-between mb-4">
              <span className="text-5xl font-bold text-slate-300 tracking-tighter leading-none">{slidesPerDay.toLocaleString()}</span>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Slides Produced Per Day</p>
            <input 
              type="range" min="100" max="10000" step="100"
              value={slidesPerDay}
              onChange={(e) => setSlidesPerDay(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 mb-4">
              <span>100</span>
              <span>10,000</span>
            </div>
            {/* Moved below the bar */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase">Days/Month</span>
                <select 
                  value={scanningDays} 
                  onChange={(e) => setScanningDays(parseInt(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-800"
                >
                  {Array.from({length: 11}, (_, i) => 20 + i).map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800">{monthlySlides.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block uppercase">Total Monthly</span>
              </div>
            </div>
          </div>

          {/* Speed Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex flex-row items-center justify-between mb-4">
              <span className="text-5xl font-bold text-slate-300 tracking-tighter leading-none">{scannerSpeedPerHour}</span>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Scanner Speed (slides/hr)</p>
            <input 
              type="range" min="20" max="70" step="1"
              value={scannerSpeedPerHour}
              onChange={(e) => setScannerSpeedPerHour(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 mb-2">
              <span>20</span>
              <span>70</span>
            </div>
            <p className="text-xs text-slate-500 italic mb-2">Speed (slides/hr). This is the real-world output speed of the scanners the client will purchase.</p>
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
              <p>Slides in 24 hours: <span className="font-bold">{(scannerSpeedPerHour * 24).toLocaleString()}</span></p>
              <p>Slides in a month ({scanningDays} days): <span className="font-bold">{(scannerSpeedPerHour * 24 * scanningDays).toLocaleString()}</span></p>
            </div>
          </div>

          {/* Output Cycle Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex flex-row items-center justify-between mb-4">
              <span className="text-5xl font-bold text-slate-300 tracking-tighter leading-none">{outputCycleHours}</span>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Scan Cycle (hours)</p>
            <input 
              type="range" min="0" max="3" step="1"
              value={
                outputCycleHours === 6 ? 0 : 
                outputCycleHours === 12 ? 1 : 
                outputCycleHours === 18 ? 2 : 3
              }
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setOutputCycleHours(v === 0 ? 6 : v === 1 ? 12 : v === 2 ? 18 : 24);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 mb-2">
              <span>6 hrs</span>
              <span>12 hrs</span>
              <span>18 hrs</span>
              <span>24 hrs</span>
            </div>
            <p className="text-xs text-slate-500 italic mb-2">The time frame in which you expect all your slides in a day to be completely scanned. The shorter this time is, it means the more scanners you will have to buy.</p>
            {outputCycleHours === 6 && <p className="font-bold text-slate-900 text-sm">Business Hour king</p>}
            {outputCycleHours === 12 && <p className="font-bold text-slate-900 text-sm">Goldilocks</p>}
            {outputCycleHours === 18 && <p className="font-bold text-slate-900 text-sm">Risky redundancy</p>}
            {outputCycleHours === 24 && <p className="font-bold text-slate-900 text-sm">No redundancy</p>}
          </div>
        </div>

        {/* Result Output */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 text-white p-6 rounded-xl flex items-center justify-between">
              <span className="text-xl font-bold">Total Scanners Needed:</span>
              <span className="text-5xl font-extrabold">{scannersNeeded}</span>
            </div>
            <div className="bg-slate-800 text-white p-6 rounded-xl flex items-center justify-between">
              <span className="text-xl font-bold">Total Output Capacity:</span>
              <span className="text-2xl font-bold capitalize">{(scannersNeeded * scannerSpeedPerHour * 24 * scanningDays).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-100 pt-8 mt-8">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Redundancy</div>
              <div className="font-semibold text-lg capitalize">{redundancy}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Speed</div>
              <div className="font-semibold text-lg capitalize">{speed}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Visible Within</div>
              <div className="font-semibold text-lg">{outputCycleHours} hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
