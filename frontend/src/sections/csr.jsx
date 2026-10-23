import { Pillar, ProjectCard } from '../components/common/Blocks'
import { Section, SectionHead, headingId } from '../components/common/Section'

/** Focus-area pillars from the CSR categories. */
export function CsrFocusAreas({ section }) {
  const c = section.content
  const categories = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead tone="csr" label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Pillar key={category.id} icon={category.icon} title={category.name} text={category.description} index={index} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/** CSR project cards linking to each project page. */
export function ProjectGrid({ section }) {
  const c = section.content
  const projects = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead tone="csr" label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        {projects.length ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-grey-200 px-6 py-12 text-center text-grey-600">New projects will be published here soon.</p>
        )}
      </div>
    </Section>
  )
}
