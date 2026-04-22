import React from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? (
        <FaCheck className="text-xs text-green-400" />
      ) : (
        <FaCopy className="text-xs text-slate-400" />
      )}
    </button>
  );
}
