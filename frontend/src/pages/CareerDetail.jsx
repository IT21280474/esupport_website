import { useParams } from 'react-router'
import Button from '../components/common/Button'
import { Section } from '../components/common/Section'
import { RichText, SectionLabel } from '../components/common/Typography'
import { useApi } from '../hooks/useApi'
import { useSeo } from '../hooks/useSeo'
import { formatDate } from '../lib/format'
import DetailHero from './DetailHero'
import ErrorView, { PageLoading } from './ErrorView'

export default function CareerDetail() {
  const { slug } = useParams()
  const { data: job, error } = useApi(`/careers/${slug}`)

  useSeo({ title: job ? `${job.title} — Careers` : undefined, description: job?.summary })

  if (!job && error) return <ErrorView status={error.status === 404 ? 404 : error.status || 500} />
  if (!job) return <PageLoading />

  const facts = [
    ['Department', job.department],
    ['Location', job.location],
    ['Type', job.employment_type_label],
    ['Closing date', job.closing_date && formatDate(job.closing_date)],
  ].filter(([, value]) => value)

  const blocks = [
    ['About the role', job.description],
    ['Responsibilities', job.responsibilities],
    ['Requirements', job.requirements],
  ].filter(([, html]) => html)

  return (
    <>
      <DetailHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Careers', to: '/careers' }, { label: job.title }]} label={job.department || 'Careers'} title={job.title} art="parts">
        {job.summary && <p className="max-w-[38em] text-lead text-silver">{job.summary}</p>}
      </DetailHero>

      <Section>
        <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[1.4fr_.8fr]">
          <div className="grid content-start gap-12">
            {blocks.map(([title, html]) => (
              <div key={title} className="grid gap-5">
                <SectionLabel>{title}</SectionLabel>
                <RichText html={html} className="text-grey-600" />
              </div>
            ))}
            {!blocks.length && <p className="text-grey-600">Full details for this role are available from our HR team on request.</p>}
          </div>

          <aside className="grid h-fit gap-6 border border-t-3 border-grey-200 border-t-navy-900 bg-white p-8 lg:sticky lg:top-28">
            <dl className="grid gap-4">
              {facts.map(([term, value]) => (
                <div key={term}>
                  <dt className="font-mono text-[.66rem] uppercase tracking-[.16em] text-grey-600">{term}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {job.is_open ? (
              <Button to={`/careers?position=${job.id}#apply`} className="w-full">
                Apply Now
              </Button>
            ) : (
              <p className="border-l-3 border-gold bg-off px-4 py-3 text-sm">This position is no longer accepting applications.</p>
            )}
            <Button to="/careers#openings" variant="ghost" icon="none" className="w-full">
              All openings
            </Button>
          </aside>
        </div>
      </Section>
    </>
  )
}
