import FeatureCard from "@/components/FeatureCard";
export default function AiFeaturesPage() {
  return (
    <div className='w-full py-16 px-4 flex justify-between items-center flex-col'>
      <div className='text-center mb-12 space-y-4'>
        <h2 className='text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700'>
           AI Features for Smarter PDFs 
        </h2>
       <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">
  Smart summaries. Easy exports. AI that works for you.
</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
        {/* Free Plan */}
        <div className='bg-white rounded-2xl  p-6 hover:scale-[1.02] transition-all'>
          <FeatureCard
            title='Free Plan'
            badge='Basic'
            features={[
              "Upload 1 PDF",
              "Summary up to 500 words",
              "Basic Gemini AI response",
              "No PDF export",
            ]}
            actionLabel='Start Free'
          />
        </div>

        {/* Pro Plan - Highlighted */}
        <div className='bg-white rounded-2xl  p-6 hover:scale-[1.02] transition-all '>
          <FeatureCard
            title='Pro Plan'
            badge='Recommended'
            features={[
              "Upload up to 10 PDFs",
              "Detailed summary (1500+ words)",
              "Ask questions about document",
              "Download summary as PDF",
            ]}
            actionLabel='Upgrade to Pro'
          />
        </div>

        {/* Enterprise Plan */}
        <div className='bg-white rounded-2xl  p-6 hover:scale-[1.02] transition-all'>
          <FeatureCard
            title='Enterprise'
            badge='Custom'
            features={[
              "Unlimited PDFs",
              "Team collaboration",
              "Priority support",
              "Custom model integration",
            ]}
            actionLabel='Contact Sales'
          />
        </div>
      </div>
    </div>
  );
}
