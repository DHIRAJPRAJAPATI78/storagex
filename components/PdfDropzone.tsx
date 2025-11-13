"use client";
import React, { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import { Sparkle, Sparkles } from "lucide-react";

interface GeminiResponse {
  candidates?: { content?: { parts?: { text: string }[] } }[];
}

const Home: React.FC = () => {
  const [fullText, setFullText] = useState<string>("");
  const [summaryText, setSummaryText] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [chatResult, setChatResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Initialize pdfjs worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const extractTextFromPDF = useCallback(
    async (file: File): Promise<string> => {
      try {
        setIsLoading("Extracting text from PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          text += pageText + "\n";
        }
        return text;
      } catch (err) {
        throw new Error(
          "Failed to extract text from PDF: " + (err as Error).message
        );
      }
    },
    []
  );

  const chunkText = useCallback((text: string, maxLength: number): string[] => {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + maxLength));
      start += maxLength;
    }
    return chunks;
  }, []);

  const fetchGemini = useCallback(async (prompt: string): Promise<string> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!res.ok) throw new Error(`API request failed: ${res.statusText}`);
      const data: GeminiResponse = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
    } catch (err) {
      throw new Error(
        "Failed to fetch from Gemini API: " + (err as Error).message
      );
    }
  }, []);

  const summarizeChunks = useCallback(
    async (chunks: string[]): Promise<string> => {
      try {
        setIsLoading("Summarizing PDF content...");
        const results: string[] = [];
        for (const chunk of chunks) {
          const summary = await fetchGemini(
            `Summarize this in detail:\n${chunk}`
          );
          results.push(summary);
        }
        return results.join("\n\n");
      } catch (err) {
        throw new Error(
          "Failed to summarize content: " + (err as Error).message
        );
      }
    },
    [fetchGemini]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      const file = e.target.files?.[0];
      if (!file) {
        setError("No file selected.");
        return;
      }
      if (file.type !== "application/pdf") {
        setError("Please select a valid PDF file.");
        return;
      }
      try {
        const text = await extractTextFromPDF(file);
        setFullText(text);
        const chunks = chunkText(text, 3000);
        const summary = await summarizeChunks(chunks);
        setSummaryText(summary);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading("");
      }
    },
    [extractTextFromPDF, chunkText, summarizeChunks]
  );

  const askQuestion = useCallback(async () => {
    if (!question || !fullText) {
      setError("Please upload a PDF or enter a question.");
      return;
    }
    setError("");
    setIsLoading("Processing question...");
    try {
      const context = fullText.slice(0, 5000);
      const prompt = `Answer this based on context:\n${context}\n\nQuestion: ${question}`;
      const answer = await fetchGemini(prompt);
      setChatResult(answer);
      setQuestion("");
    } catch (err) {
      setError("Failed to process question: " + (err as Error).message);
    } finally {
      setIsLoading("");
    }
  }, [question, fullText, fetchGemini]);

  const downloadSummary = useCallback(() => {
    if (!summaryText) {
      setError("No summary available to download.");
      return;
    }

    setError("");
    setIsLoading("Generating PDF...");

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const marginLeft = 10;
      const marginTop = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - marginLeft * 2;
      const lineHeight = 7;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);

      // Split and force-wrap long lines manually
      const words = summaryText.split(/\s+/);
      const wrappedLines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = doc.getTextWidth(testLine);

        if (testWidth <= usableWidth) {
          currentLine = testLine;
        } else {
          if (doc.getTextWidth(word) > usableWidth) {
            // break long unbreakable word
            const chars = word.split("");
            let chunk = "";
            for (const char of chars) {
              const testChunk = chunk + char;
              if (doc.getTextWidth(testChunk) > usableWidth) {
                wrappedLines.push(chunk);
                chunk = char;
              } else {
                chunk = testChunk;
              }
            }
            if (chunk) wrappedLines.push(chunk);
            if (currentLine) {
              wrappedLines.push(currentLine);
              currentLine = "";
            }
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        }
      });

      if (currentLine) wrappedLines.push(currentLine);

      // Write to PDF
      let y = marginTop;
      wrappedLines.forEach((line) => {
        if (y + lineHeight > pageHeight - marginTop) {
          doc.addPage();
          y = marginTop;
        }
        doc.text(line, marginLeft, y);
        y += lineHeight;
      });

      doc.save("summary.pdf");
    } catch (err) {
      setError("Failed to generate PDF: " + (err as Error).message);
    } finally {
      setIsLoading("");
    }
  }, [summaryText]);

  return (
    <div className='min-h-screen bg-gray-100 font-sans p-4 md:p-8'>
      <div className="text-center mb-10 px-4 space-y-3">
  <p className="text-base md:text-lg text-transparent bg-clip-text flex justify-center items-center gap-2 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700">
    <span className="inline-flex items-center gap-1">
      <Sparkles className="h-5 w-5 text-[#e81518] animate-pulse" />
      <span>AI-powered content creation</span>
    </span>
  </p>

  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800">
    Start uploading your PDFs
  </h1>

  <h2 className="text-base md:text-lg text-gray-600">
    <span className="inline-flex items-center gap-1">
      
      <span>  Upload your PDF and let our AI do the magic</span><span className="text-yellow-400">  <Sparkles/></span>
    </span>
 
  </h2>
</div>


      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto'>
        {/* LEFT SIDE: Upload & Summary */}
        <div className='flex flex-col bg-white rounded-xl shadow-md p-6 min-h-[600px]'>
          <h2 className='text-2xl font-semibold mb-4'> Upload PDF</h2>

          <input
            type='file'
            accept='application/pdf'
            onChange={handleFileChange}
            className='mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#FA7275] file:text-white hover:file:bg-[#EA6365]'
          />

          {isLoading && (
            <p className='text-green-600 font-medium'>⏳ {isLoading}</p>
          )}
          {error && <p className='text-red-600 font-medium'>❌ {error}</p>}

          <div className='mt-4 flex flex-col flex-1'>
            <h3 className='text-xl font-semibold mb-2'> Summary</h3>

            <div className='flex-1 bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-y-auto max-h-[350px] min-h-[200px] whitespace-pre-wrap'>
              {summaryText || "No summary yet."}
            </div>

            <button
              onClick={downloadSummary}
              disabled={!summaryText}
              className='mt-4 px-4 py-2 bg-[#FA7275] text-white rounded hover:bg-[#EA6365]  disabled:cursor-not-allowed self-start'
            >
            Download Summary as PDF
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Chat with PDF */}
        <div className='flex flex-col bg-white rounded-xl shadow-md p-6 min-h-[600px]'>
          <h2 className='text-2xl font-semibold mb-4'> Chat with PDF</h2>

          <textarea
            placeholder='Ask a question...'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className='w-full h-28 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA6365] resize-none'
          />

          <button
            onClick={askQuestion}
            disabled={!question}
            className='mt-4 px-4 py-2 bg-[#EA6365] text-white rounded hover:bg-[#FA7275] disabled:cursor-not-allowed self-start'
          >
            Ask Questions
          </button>

          <div className='mt-4 flex-1 bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-y-auto max-h-[350px] min-h-[200px] whitespace-pre-wrap'>
            {chatResult || "No answer yet."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
