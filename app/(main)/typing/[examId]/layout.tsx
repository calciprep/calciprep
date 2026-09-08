import { Metadata } from 'next';

type Props = {
  // 1. Update the type to expect a Promise
  params: Promise<{ examId: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  // 2. Await the params before trying to read examId
  const params = await props.params;
  
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