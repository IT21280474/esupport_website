import { useState } from 'react'
import { useParams } from 'react-router'
import { ProjectCard } from '../components/common/Blocks'
import Button from '../components/common/Button'
import Lightbox from '../components/common/Lightbox'
import Media from '../components/common/Media'
import { Section } from '../components/common/Section'
import { RichText, SectionLabel } from '../components/common/Typography'
import { useApi } from '../hooks/useApi'
import { useSeo } from '../hooks/useSeo'
import { formatDate } from '../lib/format'
import DetailHero from './DetailHero'
import ErrorView, { PageLoading } from './ErrorView'

export default function CsrDetail() {
  const { slug } = useParams()
  const { data, error } = useApi(`/csr/${slug}`)
  const [open, setOpen] = useState(null)
  const project = data?.project

  useSeo({
    title: project?.meta_title || project?.title,
    rawTitle: Boolean(project?.meta_title),
    description: project?.meta_description || project?.excerpt,
    image: project?.image,
  })

  if (!project && error) return <ErrorView status={error.status === 404 ? 404 : error.status || 500} />
  if (!project) return <PageLoading />

  const gallery = project.gallery || []
  const facts = [
    ['Focus area', project.category?.name],
    ['When', project.date_label || formatDate(project.project_date, { month: 'long', year: 'numeric' })],
    ['Where', project.location],
  ].filter(([, value]) => value)

  return (
    <>
      <DetailHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'CSR Projects', to: '/csr' }, { label: project.title }]}
        label={project.category?.name || 'CSR'}
        title={project.title}
        image={project.image}
        art="community"
      />

      <Section>
        <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[1.4fr_.8fr]">
          <div className="grid content-start gap-6">
            {project.excerpt && <p className="text-lead text-grey-600">{project.excerpt}</p>}
            <RichText html={project.description} className="text-grey-600" />
          </div>
          <aside className="grid h-fit gap-6 border border-t-3 border-grey-200 border-t-csr bg-white p-8">
            {facts.length > 0 && (
              <dl className="grid gap-4">
                {facts.map(([term, value]) => (
                  <div key={term}>
                    <dt className="font-mono text-[.66rem] uppercase tracking-[.16em] text-grey-600">{term}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Button to="/contact?area=csr#message" className="w-full">
              Get involved
            </Button>
          </aside>
        </div>

        {gallery.length > 0 && (
          <div className="wrap mt-16">
            <h2>
              <SectionLabel tone="csr">Gallery</SectionLabel>
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallery.map((image, index) => (
                <button key={image.id} type="button" onClick={() => setOpen(index)} aria-label={`Open image ${index + 1}`} className="group cursor-zoom-in overflow-hidden rounded-xs">
                  <Media image={image} art="community" className="aspect-[4/3]" imgClassName="group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {!!data.related?.length && (
        <Section theme="off">
          <div className="wrap">
            <h2>
              <SectionLabel tone="csr">More initiatives</SectionLabel>
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
              {data.related.map((item, index) => (
                <ProjectCard key={item.id} project={item} index={index} />
              ))}
            </div>
          </div>
        </Section>
      )}

      <Lightbox
        items={gallery.map((image) => ({ id: image.id, image, title: project.title, art: 'community' }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </>
  )
}
