import { lazy, Suspense } from 'react';
import Spinner from '../components/common/Spinner';
import SEO from '../components/common/SEO';
import { servicePageSchema, breadcrumbSchema } from '../utils/schema';

const SearchWorkers = lazy(() => import('./customer/SearchWorkers'));

// ─── Service metadata map ──────────────────────────────────────────────────────
const SERVICE_META = {
  maid: {
    label: 'Maid Service',
    description: 'verified and background-checked maids for daily housekeeping',
    filter: 'house_cleaning',
  },
  'part-time-maid': {
    label: 'Part-Time Maid',
    description: 'part-time maids for 2–4 hours daily cleaning and housekeeping',
    filter: 'house_cleaning',
  },
  'full-time-maid': {
    label: 'Full-Time Maid',
    description: 'full-time maids for complete daily housekeeping and household work',
    filter: 'house_cleaning',
  },
  babysitter: {
    label: 'Babysitter & Nanny',
    description: 'trusted babysitters and nannies for childcare and infant supervision',
    filter: 'babysitting',
  },
  cook: {
    label: 'Home Cook',
    description: 'experienced cooks for daily cooking, meal prep, and kitchen assistance',
    filter: 'cooking',
  },
  'house-cleaning': {
    label: 'House Cleaning',
    description: 'professional house cleaning for regular, deep, and post-move cleaning',
    filter: 'house_cleaning',
  },
  'elder-care': {
    label: 'Elder Care Helper',
    description: 'compassionate elder care helpers and trained caregivers for seniors',
    filter: 'elder_care',
  },
};

// ─── City / area metadata map ──────────────────────────────────────────────────
const CITY_META = {
  bangalore: { name: 'Bangalore', parent: null },
  whitefield: { name: 'Whitefield', parent: 'Bangalore' },
  koramangala: { name: 'Koramangala', parent: 'Bangalore' },
  'hsr-layout': { name: 'HSR Layout', parent: 'Bangalore' },
  marathahalli: { name: 'Marathahalli', parent: 'Bangalore' },
  indiranagar: { name: 'Indiranagar', parent: 'Bangalore' },
  jayanagar: { name: 'Jayanagar', parent: 'Bangalore' },
  'electronic-city': { name: 'Electronic City', parent: 'Bangalore' },
  'btm-layout': { name: 'BTM Layout', parent: 'Bangalore' },
  'bannerghatta-road': { name: 'Bannerghatta Road', parent: 'Bangalore' },
};

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" color="navy" />
    </div>
  );
}

/**
 * LocalServicePage — one component, zero new UI.
 * Renders the existing SearchWorkers page pre-filtered for a service + city,
 * while injecting unique SEO metadata for each combination.
 */
export default function LocalServicePage({ service, city }) {
  const svc = SERVICE_META[service] || SERVICE_META['maid'];
  const loc = CITY_META[city] || CITY_META['bangalore'];

  const canonicalSlug = `/${service}-${city}`;
  const canonicalUrl = `https://www.maidsaathi.in${canonicalSlug}`;

  const seoTitle = `${svc.label} in ${loc.name} – Book Online | MaidSaathi`;
  const seoDescription = `Hire ${svc.description} in ${loc.name}${loc.parent ? `, ${loc.parent}` : ''}. Background-checked workers. Instant online booking. Trusted by hundreds of families in ${loc.name}.`;

  const crumbs = [
    { name: 'Home', url: 'https://www.maidsaathi.in' },
  ];
  if (loc.parent) {
    crumbs.push({
      name: `${svc.label} in ${loc.parent}`,
      url: `https://www.maidsaathi.in/${service}-${loc.parent.toLowerCase()}`,
    });
  }
  crumbs.push({ name: `${svc.label} in ${loc.name}`, url: canonicalUrl });

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        schema={[
          servicePageSchema(svc.label, seoDescription, canonicalUrl, loc.name),
          breadcrumbSchema(crumbs),
        ]}
      />
      <Suspense fallback={<PageSpinner />}>
        <SearchWorkers prefilterService={svc.filter} prefilterCity={loc.name} />
      </Suspense>
    </>
  );
}
