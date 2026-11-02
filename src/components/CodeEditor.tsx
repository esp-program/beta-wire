import React, { useState } from 'react';
import { Play, Square, Pause, RotateCcw, Copy, Check, Code, Sparkles, BookOpen } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  isSimulating: boolean;
  isPaused: boolean;
  onCodeChange: (newCode: string) => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  isSimulating,
  isPaused,
  onCodeChange,
  onStartSimulation,
  onPauseSimulation,
  onStopSimulation,
  onResetSimulation,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertSnippet = (snippet: string) => {
    onCodeChange(code + '\n' + snippet);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 select-none">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded text-xs font-mono text-slate-200">
            <Code className="w-3.5 h-3.5 text-blue-400" />
            <span>sketch.ino</span>
          </div>
          <span className="text-[11px] text-slate-400">C++ Arduino / ESP32</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {!isSimulating ? (
            <button
              onClick={onStartSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm"
              title="Compilar y ejecutar en tiempo real"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Simulación</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPauseSimulation}
                className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1 ${
                  isPaused
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
                title={isPaused ? 'Reanudar' : 'Pausar simulación'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onStopSimulation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors"
                title="Detener simulación"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Detener</span>
              </button>
            </>
          )}

          <button
            onClick={onResetSimulation}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Reiniciar microcontrolador"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Copiar código al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Snippets Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto text-[11px]">
        <span className="text-slate-400 whitespace-nowrap shrink-0 text-[10px]">Insertar:</span>
        <button
          onClick={() => insertSnippet('digitalWrite(13, HIGH);')}
          className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-mono whitespace-nowrap transition-colors"
        >
          digitalWrite()
        </button>
        <button
          onClick={() => insertSnippet('int valor = analogRead(A0);')}
          className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-mono whitespace-nowrap transition-colors"
        >
          analogRead()
        </button>
        <button
          onClick={() => insertSnippet('Serial.println("Valor: ");')}
          className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-mono whitespace-nowrap transition-colors"
        >
          Serial.println()
        </button>
        <button
          onClick={() => insertSnippet('delay(500);')}
          className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-mono whitespace-nowrap transition-colors"
        >
          delay()
        </button>
        <button
          onClick={() => insertSnippet('tone(8, 440);')}
          className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-mono whitespace-nowrap transition-colors"
        >
          tone()
        </button>
      </div>

      {/* Main Code Area with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-11 py-3 bg-slate-950/80 border-r border-slate-800/60 text-slate-600 text-right pr-2 select-none overflow-hidden font-mono text-[11px] leading-5">
          {Array.from({ length: Math.max(lineCount, 25) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none font-mono text-[12px] leading-5 focus:ring-0 selection:bg-blue-600/30 selection:text-blue-100"
          placeholder="// Escribe aquí tu código Arduino setup() y loop()..."
        />
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulating
                  ? isPaused
                    ? 'bg-amber-400'
                    : 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-600'
              }`}
            />
            <span>
              {isSimulating
                ? isPaused
                  ? 'Simulación en Pausa'
                  : 'Microcontrolador en Ejecución'
                : 'Listo para simular'}
            </span>
          </span>
          <span>·</span>
          <span>{lineCount} líneas</span>
        </div>

        <div className="text-slate-400 font-mono text-[10px]">
          AVR / Xtensa Core Ready
        </div>
      </div>
    </div>
  );
};
