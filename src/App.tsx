import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [childAge, setChildAge] = useState(0);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [includeInflation, setIncludeInflation] = useState(false);

  // Constants
  const netRateAccumulation = 1.06; // 6% p.a.

  // Derived Calculation
  const { monthlyContribution, data, milestones } = useMemo(() => {
    const targetAge = 18;
    const endAge = 67;

    const inflationRate = 1.02; // 2% p.a.
    const yearsAccumulation = targetAge - childAge;

    // Adjusted Target Amount if inflation is included
    const actualTargetAmount = includeInflation && yearsAccumulation > 0
      ? targetAmount * Math.pow(inflationRate, yearsAccumulation)
      : targetAmount;

    // Calculate Required Monthly Contribution to reach actualTargetAmount at 18
    const i1 = Math.pow(netRateAccumulation, 1 / 12) - 1;
    const monthsAccumulation = yearsAccumulation * 12;

    let calcedContribution = 0;
    if (monthsAccumulation > 0) {
      // FV factor for annuity due (start of month)
      const fvFactor = ((Math.pow(1 + i1, monthsAccumulation) - 1) / i1) * (1 + i1);
      calcedContribution = actualTargetAmount / fvFactor;
    }

    // Generate Data Points
    const dataPoints = [];
    let currentWealth = 0;

    const milestonesVals = {
      at18: 0,
      at25: 0,
      at40: 0,
      at67: 0
    };

    const growthFactor = Math.pow(netRateAccumulation, 1 / 12);

    dataPoints.push({ age: childAge, wealth: 0 }); // Startpunkt

    for (let age = childAge; age < endAge; age++) {
      // Calculate 12 months
      for (let m = 0; m < 12; m++) {
        currentWealth += calcedContribution;
        currentWealth *= growthFactor;
      }

      const displayAge = age + 1;

      if (displayAge === targetAge) {
        milestonesVals.at18 = currentWealth;
        // Point exactly at 18 BEFORE withdrawal
        dataPoints.push({ age: displayAge, wealth: Math.round(currentWealth) });
        // 80% withdrawal
        currentWealth *= 0.2;
        // Point exactly at 18 AFTER withdrawal for sharp visual drop
        dataPoints.push({ age: displayAge, wealth: Math.round(currentWealth) });
      } else {
        dataPoints.push({
          age: displayAge,
          wealth: Math.round(currentWealth),
        });
      }

      if (displayAge === 25) milestonesVals.at25 = currentWealth;
      if (displayAge === 40) milestonesVals.at40 = currentWealth;
      if (displayAge === 67) milestonesVals.at67 = currentWealth;
    }

    return {
      monthlyContribution: calcedContribution,
      data: dataPoints,
      milestones: milestonesVals
    };
  }, [childAge, targetAmount, includeInflation]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-white text-[#222] font-sans p-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#8bbd2a] mb-6">Sparen für die Zukunft</h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-lg font-medium text-gray-700">
          <p>
            Früh anfangen heißt: <span className="font-['Caveat'] text-3xl font-bold">Träume möglich machen.</span>
          </p>
        </div>
      </header>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">

          {/* Target Amount Slider */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-bold tracking-wider text-[#1a1a1a]">WUNSCHBETRAG ZUM 18. GEBURTSTAG</label>
            </div>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-[#8bbd2a]">{targetAmount.toLocaleString('de-DE')} €</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8bbd2a]"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-300 mb-6">
              <span>1.000 €</span><span>50.000 €</span>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-[#8bbd2a] focus:ring-[#8bbd2a] cursor-pointer"
                checked={includeInflation}
                onChange={(e) => setIncludeInflation(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">Inflation berücksichtigen (2% p.a.)</span>
            </label>
          </div>

          {/* Age Slider */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-bold tracking-wider text-[#1a1a1a]">SPAREN AB ALTER</label>
            </div>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-[#8bbd2a]">{childAge} J.</span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8bbd2a]"
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-300">
              <span>0</span><span>18</span>
            </div>
          </div>

          {/* Contribution Display */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-bold tracking-wider text-[#1a1a1a]">BENÖTIGTER SPARBEITRAG MONATLICH</label>
            </div>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-[#8bbd2a]">{Math.round(monthlyContribution).toLocaleString('de-DE')} €</span>
            </div>
          </div>

        </div>

        {/* Right Column: Chart & Results */}
        <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col min-h-[670px] lg:h-full">
          <div className="flex-1 flex flex-col">
            <h3 className="text-center text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest">Beispielrechnung für den Vermögensaufbau</h3>
            <p className="text-center text-[10px] leading-relaxed text-gray-400 mb-6 max-w-xl mx-auto">
              Die Berechnung zeigt das angesparte Kapital bis zum 67. Lebensjahr. Zum 18. Geburtstag werden 80% des Vermögenswerts entnommen. Es wird von einer jährlichen Wertentwicklung von 6% netto ausgegangen. Es liegt kein konkretes Finanzprodukt zu Grunde.
            </p>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 40,
                    left: 20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8bbd2a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8bbd2a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis
                    type="number"
                    domain={[childAge, 67]}
                    dataKey="age"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    ticks={[childAge, 18, 25, 40, 67]}
                  />
                  <YAxis
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value.toLocaleString('de-DE')} €`}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => `Alter: ${label} Jahre`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="linear"
                    dataKey="wealth"
                    stroke="#8bbd2a"
                    strokeWidth={3}
                    fill="url(#colorWealth)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-8">
            <h4 className="text-center text-gray-500 text-xs uppercase tracking-widest mb-4 font-semibold">Vermögenswert im Alter von ...</h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { age: 18, val: milestones.at18 },
                { age: 25, val: milestones.at25 },
                { age: 40, val: milestones.at40 },
                { age: 67, val: milestones.at67 }
              ].map((m, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 text-center flex flex-col justify-center h-full">
                  <div className="text-[#8bbd2a] font-bold text-lg md:text-xl truncate leading-none mb-1">
                    {formatCurrency(m.val).replace('€', '').trim()} €
                  </div>
                  <div className="text-gray-400 text-xs font-medium uppercase">
                    {m.age} Jahren
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
