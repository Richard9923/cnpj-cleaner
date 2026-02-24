import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Trash2, FileText, AlertCircle } from 'lucide-react';

function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

function isValidDocument(doc: string) {
  const cleaned = doc.replace(/[^\d]+/g, '');
  if (cleaned.length === 14) return isValidCNPJ(cleaned);
  return false;
}


export default function App() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  // Removes dots, commas, slashes, hyphens, and spaces. 
  // It intentionally keeps newlines (\n) in case you paste a list of multiple CNPJs!
  const processedLines = inputText.split('\n').map(line => {
    const cleaned = line.replace(/[-.,/ ]/g, '');
    if (!cleaned) return { cleaned: '', isValid: true };
    return {
      cleaned: `cgc ${cleaned}`,
      isValid: isValidDocument(cleaned)
    };
  });

  const cleanedText = processedLines
    .map(p => p.cleaned)
    .filter(Boolean)
    .join('\n');

  const invalidLines = processedLines.filter(p => p.cleaned && !p.isValid);
  const hasInvalid = invalidLines.length > 0;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.style.height = 'auto';
      outputRef.current.style.height = `${outputRef.current.scrollHeight}px`;
    }
  }, [cleanedText]);


  const handleCopy = () => {
    if (!cleanedText) return;

    // Using execCommand for better compatibility within iframes
    const textArea = document.createElement("textarea");
    textArea.value = cleanedText;
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }

    document.body.removeChild(textArea);
  };

  const clearText = () => {
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      
      {/* Container 1: The CNPJ Cleaner */}
      <div className="max-w-[440px] w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 dark:border-slate-700/50 relative z-10 transition-all hover:shadow-blue-500/10 h-fit flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 bg-blue-600 dark:bg-blue-700 text-white flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-tight">CNPJ Cleaner</h1>
        </div>

        <div className="p-8 space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <label htmlFor="raw-input" className="block text-sm font-semibold text-gray-600 dark:text-gray-300">
              Paste your CNPJ (or multiple)
            </label>
            <textarea
              ref={inputRef}
              id="raw-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 12.345.678/0001-90"
              rows={4}
              className={`w-full min-h-[8rem] p-4 rounded-2xl border transition-all resize-none shadow-inner text-base leading-relaxed dark:text-slate-100 ${
                hasInvalid 
                  ? 'border-red-300 dark:border-red-500/50 bg-red-50/50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                  : 'border-slate-200 dark:border-slate-600/50 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            ></textarea>
            {hasInvalid && (
              <div className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {invalidLines.length === 1 
                    ? "Invalid CNPJ detected." 
                    : `${invalidLines.length} invalid CNPJs detected.`}
                </span>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300">
              Cleaned Result
            </label>
            <div className="relative">
              <textarea
                ref={outputRef}
                readOnly
                value={cleanedText}
                placeholder="cgc 12345678000190"
                rows={4}
                className="w-full min-h-[8rem] p-4 pb-20 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-mono text-lg leading-relaxed focus:outline-none resize-none shadow-inner"
              ></textarea>
              
              {/* Floating Action Buttons over the output */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={clearText}
                  disabled={!inputText}
                  className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!cleanedText}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${
                    copied 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/25 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-auto">
            Automatically strips dots (.), commas (,), slashes (/), hyphens (-), and spaces.
          </p>
        </div>
      </div>

    </div>
  );
}
