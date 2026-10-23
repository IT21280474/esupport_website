import { useSite } from '../../contexts/SiteContext'

const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')

/** schema.org Organization data (JSON-LD) built from Settings, for search engines. */
export default function OrganizationSchema() {
  const { company, contact, social } = useSite()
  if (!company.name) return null

  const phones = [contact.phone_1, contact.phone_2, contact.phone_3].filter(Boolean)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: SITE_URL,
    logo: company.logo?.url,
    foundingDate: company.established ? String(company.established) : undefined,
    founder: company.founder ? { '@type': 'Person', name: company.founder } : undefined,
    foundingLocation: company.founded_in ? { '@type': 'Place', name: company.founded_in } : undefined,
    description: company.description,
    email: contact.email,
    telephone: phones[0] ? `+94${phones[0].replace(/\D/g, '').replace(/^0/, '')}` : undefined,
    address: contact.address ? { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'LK' } : undefined,
    sameAs: social.map((link) => link.url),
  }

  return <script type="application/ld+json">{JSON.stringify(data).replace(/</g, '\\u003c')}</script>
}
