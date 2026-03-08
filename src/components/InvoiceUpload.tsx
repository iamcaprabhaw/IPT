import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { extractInvoiceData } from '../services/gemini';
import { InvoiceData } from '../types';
import { CameraCapture } from './CameraCapture';

interface InvoiceUploadProps {
  onInvoicesProcessed: (invoices: InvoiceData[]) => void;
}

export const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onInvoicesProcessed }) => {
  const [files, setFiles] = useState<{ file: File; status: 'idle' | 'processing' | 'done' | 'error'; error?: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({ file, status: 'idle' as const }))
    ]);
  }, []);

  const handleCameraCapture = (file: File) => {
    setFiles(prev => [...prev, { file, status: 'idle' as const }]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert("Gemini API key is missing. Extraction cannot start.");
      return;
    }
    setIsProcessing(true);
    const results: InvoiceData[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'idle') continue;

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i].status = 'processing';
        return newFiles;
      });

      try {
        const data = await extractInvoiceData(files[i].file);
        const invoice: Omit<InvoiceData, 'id'> = {
          invoiceNumber: data.invoiceNumber || 'N/A',
          date: data.date || new Date().toISOString().split('T')[0],
          vendorName: data.vendorName || 'Unknown',
          category: data.category || 'General',
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
          currency: data.currency || 'INR',
          itcStatus: (data.itcStatus as 'eligible' | 'blocked') || 'eligible',
          itcReason: data.itcReason || 'No specific reason provided.',
          items: data.items || [],
          status: 'processed',
          fileName: files[i].file.name
        };
        results.push(invoice as any); // Cast as any because App.tsx expects InvoiceData[] but we'll handle insertion
        
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'done';
          return newFiles;
        });
      } catch (error) {
        console.error(`Error processing ${files[i].file.name}:`, error);
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'error';
          newFiles[i].error = 'Failed to extract data';
          return newFiles;
        });
      }
    }

    onInvoicesProcessed(results);
    setIsProcessing(false);
    
    if (results.length > 0) {
      alert(`Successfully processed ${results.length} invoices and saved to Supabase.`);
      setFiles([]); // Clear queue on success
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          {...getRootProps()} 
          className={`md:col-span-2 border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
        >
          <input {...getInputProps()} />
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Upload Invoices</h3>
          <p className="text-slate-500 mt-2">Drag & drop files here, or click to browse</p>
          <p className="text-xs text-slate-400 mt-4">Supports PDF, JPG, PNG</p>
        </div>

        <button 
          onClick={() => setIsCameraOpen(true)}
          className="border-2 border-slate-200 rounded-3xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all group flex flex-col items-center justify-center"
        >
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Camera className="text-blue-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Scan with Camera</h3>
          <p className="text-slate-500 mt-2">Take a photo of your physical invoice</p>
        </button>
      </div>

      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center space-x-4">
              <h4 className="font-bold text-slate-700">Queue ({files.length} files)</h4>
              <button 
                onClick={() => setFiles([])}
                className="text-xs text-rose-500 font-semibold hover:underline"
              >
                Clear Queue
              </button>
            </div>
            <button 
              onClick={processFiles}
              disabled={isProcessing || !files.some(f => f.status === 'idle')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : null}
              <span>
                {isProcessing ? 'Processing...' : 
                 files.every(f => f.status === 'done') ? 'All Processed' : 
                 'Start Extraction'}
              </span>
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {files.map((fileObj, index) => (
              <div key={index} className="p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <File className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{fileObj.file.name}</p>
                    <p className="text-xs text-slate-400">{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {fileObj.status === 'processing' && <Loader2 className="animate-spin text-blue-500" size={20} />}
                  {fileObj.status === 'done' && <CheckCircle className="text-emerald-500" size={20} />}
                  {fileObj.status === 'error' && (
                    <div className="flex flex-col items-end text-rose-500">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setFiles(prev => {
                              const newFiles = [...prev];
                              newFiles[index].status = 'idle';
                              return newFiles;
                            });
                          }}
                          className="text-[10px] bg-rose-50 px-2 py-0.5 rounded hover:bg-rose-100 transition-colors"
                        >
                          Retry
                        </button>
                        <AlertCircle size={16} />
                        <span className="text-xs font-bold">Error</span>
                      </div>
                      <span className="text-[10px] text-rose-400 mt-1">{fileObj.error}</span>
                    </div>
                  )}
                  {fileObj.status === 'idle' && (
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
