import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://calciprep.online';

  return [
    // 1. Homepage & Dashboard
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },

    // 2. Maths Speed Calculation Hub
    { url: `${baseUrl}/maths`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/maths/games`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // 3. English PYQ & Vocabulary Hub
    { url: `${baseUrl}/english`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/english/quiz-list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // 4. Typing Practice & Interfaces (Explicit Exam Routes)
    { url: `${baseUrl}/typing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/typing/delhi_police_hcm`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/typing/ssc_cgl`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/typing/ssc_chsl`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/typing/custom`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // 5. Live Tests Hub & Dedicated Exam Tests
    { url: `${baseUrl}/live-tests`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/live-tests/typing/delhi_police_hcm`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/live-tests/typing/ssc_cgl`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/live-tests/typing/ssc_chsl`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // 6. Informational & Legal Pages
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}