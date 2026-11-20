import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-200">
      
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 
          Applied minimal top padding to reduce gap between fixed header and content.
        */}
        <main className="flex-1 pt-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}