"use client"
import dynamic from "next/dynamic";

const PdfSummarizer = dynamic(() => import("../../components/PdfDropzone"), {
  ssr: false,
});

export default function upload() {
  return <PdfSummarizer />;
}
