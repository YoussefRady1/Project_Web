import { useState } from "react";
import TokenInput from "./components/TokenInput";
import AnimationController from "./controllers/AnimationController";
import MainCanvas from "./visualizers/MainCanvas";

function App() {
  const [tokens, setTokens] = useState([]);
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      
      {/* INPUT */}
      <div className="p-6 border-b border-slate-800">
        <TokenInput setTokens={setTokens} />
      </div>

      {/* CONTROLLER */}
      <div className="p-4 border-b border-slate-800">
        <AnimationController step={step} setStep={setStep} />
      </div>

      {/* MAIN VISUALIZATION */}
      <div className="flex-1 flex items-center justify-center">
        {tokens.length > 0 ? (
          <MainCanvas step={step} tokens={tokens} />
        ) : (
          <div className="text-slate-400 text-center">
            Enter a sentence to start visualization
          </div>
        )}
      </div>
    </div>
  );
}

export default App;