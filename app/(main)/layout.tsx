import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import Notification from '@/components/common/Notification';
import LenisProvider from '@/components/common/LenisProvider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <div className="flex min-h-screen bg-slate-50">
        
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

        <Notification />
      </div>
    </LenisProvider>
  );
}