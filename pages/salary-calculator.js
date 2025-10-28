import React, { useState, useEffect } from "react";

export default function PayCalculator() {
  const [totalConvos, setTotalConvos] = useState("");
  const [rawAvg, setRawAvg] = useState("");
  const [lateConvos, setLateConvos] = useState("");
  const [lateAvg, setLateAvg] = useState("");
  const [target, setTarget] = useState("20");
  const [adjustedAvg, setAdjustedAvg] = useState(null);
  const [finalPay, setFinalPay] = useState(null);

  useEffect(() => {
    calculatePay();
  }, [totalConvos, rawAvg, lateConvos, lateAvg, target]);

  const calculatePay = () => {
    const N = parseFloat(totalConvos) || 0;
    const RawAvg = parseFloat(rawAvg) || 0;
    const A = parseFloat(lateConvos) || 0;
    const Lavg = parseFloat(lateAvg) || 0;
    const Target = parseFloat(target) || 0;

    if (N > 0) {
      const adjusted = A < N ? (RawAvg * N - Lavg * A) / (N - A) : RawAvg;
      setAdjustedAvg(adjusted.toFixed(2));

      const basePay = N * 15;
      let pay = basePay;
      if (adjusted > Target) {
        pay = basePay * (Target / adjusted);
      }
      setFinalPay(pay.toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          Response Pay Calculator
        </h1>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Total Conversations (N)"
            value={totalConvos}
            onChange={(e) => setTotalConvos(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Raw Avg Response (mins)"
            value={rawAvg}
            onChange={(e) => setRawAvg(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Late Chats (A)"
            value={lateConvos}
            onChange={(e) => setLateConvos(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Avg Late Response (mins)"
            value={lateAvg}
            onChange={(e) => setLateAvg(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Target Response Time (mins)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>
        {adjustedAvg !== null && finalPay !== null && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-lg font-semibold">
              Adjusted Avg Response Time:{" "}
              <span className="text-blue-600">{adjustedAvg} mins</span>
            </p>
            <p className="text-lg font-semibold mt-2">
              Final Salary: <span className="text-green-600">₦{finalPay}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
