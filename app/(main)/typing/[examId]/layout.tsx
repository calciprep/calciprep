import { Metadata } from 'next';

type Props = {
  params: { examId: string };
  children: React.ReactNode;
};

// This function dynamically generates the SEO tags based on the URL!
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Converts "ssc_cgl" into "SSC CGL"
  const formattedExamName = params.examId.replace(/_/g, ' ').toUpperCase(); 

  return {
    title: `${formattedExamName} Typing Test Online Simulator | Calciprep`,
    description: `Practice the official ${formattedExamName} typing test pattern online. Get instant Net WPM scores, error percentage calculations, and targeted weakness analysis.`,
  };
}

export default function DynamicExamLayout({ children }: Props) {
  return <>{children}</>;
}