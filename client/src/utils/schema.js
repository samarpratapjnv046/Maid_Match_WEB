// ─── Static schemas ────────────────────────────────────────────────────────────

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MaidSaathi',
  url: 'https://www.maidsaathi.in',
  logo: 'https://www.maidsaathi.in/ms-icon.png',
  description:
    "MaidSaathi is India's trusted platform for booking verified domestic workers including maids, cooks, babysitters, and home helpers.",
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-85430-02135',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi', 'Kannada'],
  },
  sameAs: [
    'https://www.facebook.com/maidsaathi',
    'https://www.instagram.com/maidsaathi',
  ],
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'MaidSaathi',
  image: 'https://www.maidsaathi.in/og-homepage.jpg',
  url: 'https://www.maidsaathi.in',
  telephone: '+91-85430-02135',
  email: 'help@MaidSaathi.in',
  description:
    'Book verified maids, cooks, babysitters and domestic helpers in Bangalore.',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Online Payment, UPI, Credit Card, Debit Card',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    postalCode: '560001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '12.9716',
    longitude: '77.5946',
  },
  areaServed: [
    'Bangalore',
    'Whitefield',
    'Koramangala',
    'Marathahalli',
    'HSR Layout',
    'Indiranagar',
    'Jayanagar',
    'Electronic City',
    'BTM Layout',
    'Bannerghatta Road',
    'Bellandur',
    'Sarjapur Road',
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ],
    opens: '08:00',
    closes: '20:00',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: '120',
    bestRating: '5',
    worstRating: '1',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MaidSaathi',
  url: 'https://www.maidsaathi.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate:
        'https://www.maidsaathi.in/workers?service={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I book a maid in Bangalore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simply search for workers on MaidSaathi, select a verified maid based on your requirements, and book online in under 60 seconds. Pay securely via UPI, credit card, or debit card.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the maids on MaidSaathi background-checked?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All domestic workers on MaidSaathi go through a thorough verification process including Aadhaar identity check, address verification, and background screening before they can accept bookings.',
      },
    },
    {
      '@type': 'Question',
      name: 'What services does MaidSaathi offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MaidSaathi offers part-time maid, full-time maid, house cleaning, deep cleaning, cooking, babysitting, elder care, laundry, and home helper services in Bangalore.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the cost of hiring a maid in Bangalore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rates vary by service type, hours, and experience. Part-time maids typically cost ₹3,000–₹7,000/month. Full-time maids range from ₹8,000–₹15,000/month. View exact pricing on each worker profile on MaidSaathi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I hire a cook in Bangalore through MaidSaathi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. MaidSaathi has verified cooks available in Bangalore for daily cooking, breakfast/dinner preparation, and full meal prep. Search by hours and locality on the website.',
      },
    },
  ],
};

// ─── Dynamic schemas ───────────────────────────────────────────────────────────

export const workerProfileSchema = (worker) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: worker?.name || 'Domestic Worker',
  jobTitle: worker?.services?.[0] || 'Domestic Worker',
  image: worker?.profile_photo || 'https://www.maidsaathi.in/og-homepage.jpg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: worker?.location?.city || 'Bangalore',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'MaidSaathi',
    url: 'https://www.maidsaathi.in',
  },
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export const servicePageSchema = (serviceName, description, url, areaName) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: serviceName,
  description: description,
  url: url,
  provider: {
    '@type': 'LocalBusiness',
    name: 'MaidSaathi',
    url: 'https://www.maidsaathi.in',
    telephone: '+91-85430-02135',
  },
  areaServed: {
    '@type': 'City',
    name: areaName || 'Bangalore',
  },
  serviceType: serviceName,
});
