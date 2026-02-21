import { useState } from 'react';
import { Copy, Check, Trash2, FileText } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Removes dots, commas, slashes, hyphens, and spaces. 
  // It intentionally keeps newlines (\n) in case you paste a list of multiple CNPJs!
  const cleanedText = inputText
    .split('\n')
    .map(line => {
      const cleaned = line.replace(/[-.,/ ]/g, '');
      return cleaned ? `cgc ${cleaned}` : '';
    })
    .filter(Boolean)
    .join('\n');


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 font-sans text-gray-800 dark:text-gray-100">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
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
              id="raw-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 12.345.678/0001-90"
              className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none dark:text-gray-100"
            ></textarea>
          </div>

          {/* Output Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300">
              Cleaned Result
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={cleanedText}
                placeholder="cgc 12345678000190"
                className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-mono text-lg focus:outline-none resize-none"
              ></textarea>
              
              {/* Floating Action Buttons over the output */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={clearText}
                  disabled={!inputText}
                  className="p-2 bg-white dark:bg-gray-700 text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!cleanedText}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
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

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Automatically strips dots (.), commas (,), slashes (/), hyphens (-), and spaces. Line breaks are preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
