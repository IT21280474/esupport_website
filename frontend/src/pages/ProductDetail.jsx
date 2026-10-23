import { useState } from 'react'
import { useParams } from 'react-router'
import { ProductCard } from '../components/common/Blocks'
import Button from '../components/common/Button'
import Lightbox from '../components/common/Lightbox'
import Media from '../components/common/Media'
import { Section } from '../components/common/Section'
import { RichText, SectionLabel } from '../components/common/Typography'
import { Field, FormStatus, Honeypot, Input, Textarea, honeypotValue } from '../components/forms/Fields'
import { useSite } from '../contexts/SiteContext'
import { useApi } from '../hooks/useApi'
import { rules, useForm } from '../hooks/useForm'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSeo } from '../hooks/useSeo'
import { api } from '../lib/api'
import DetailHero from './DetailHero'
import ErrorView, { PageLoading } from './ErrorView'

function PartRequestForm({ product }) {
  const form = useForm({
    initial: { name: '', phone: '', email: '', message: '' },
    validate: (v) => ({
      name: rules.required(v.name),
      phone: rules.required(v.phone) || rules.phone(v.phone),
      email: rules.email(v.email),
    }),
    onSubmit: (values, formEl) =>
      api.post('/part-requests', {
        ...values,
        product: [product.name, product.sku && `#${product.sku}`].filter(Boolean).join(' '),
        category: product.category?.name,
        company_website: honeypotValue(formEl),
      }),
  })
  const submitting = form.status.state === 'submitting'

  return (
    <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Field label="Your name" required error={form.errors.name}>
        {(a) => <Input autoComplete="name" {...a} {...form.bind('name')} />}
      </Field>
      <Field label="Phone" required error={form.errors.phone}>
        {(a) => <Input type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
      </Field>
      <Field full label="Email" error={form.errors.email}>
        {(a) => <Input type="email" autoComplete="email" {...a} {...form.bind('email')} />}
      </Field>
      <Field full label="Vehicle / quantity / notes" error={form.errors.message}>
        {(a) => <Textarea className="min-h-28" {...a} {...form.bind('message')} />}
      </Field>
      <div className="col-span-full">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Request this part'}
        </Button>
      </div>
      <FormStatus status={form.status} />
    </form>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { data, error } = useApi(`/products/${slug}`)
  const { whatsappUrl } = useSite()
  const [open, setOpen] = useState(null)
  const product = data?.product

  usePageChrome({ whatsapp: 'spare_parts' })
  useSeo({
    title: product?.meta_title || product?.name,
    rawTitle: Boolean(product?.meta_title),
    description: product?.meta_description || product?.short_description,
    image: product?.image,
  })

  if (!product && error) return <ErrorView status={error.status === 404 ? 404 : error.status || 500} />
  if (!product) return <PageLoading />

  const images = [product.image, ...(product.gallery || [])].filter(Boolean)
  const lightboxItems = images.map((image, index) => ({ id: index, image, title: product.name, art: 'parts' }))
  const facts = [
    ['Part number', product.sku],
    ['Category', product.category?.name],
    ['Brand', product.brand?.name],
    ['Vehicles', product.vehicle_types?.map((v) => v.name).join(', ')],
  ].filter(([, value]) => value)
  const waHref = whatsappUrl('spare_parts', `Product: ${product.name}${product.sku ? ` (#${product.sku})` : ''}`)

  return (
    <>
      <DetailHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Spare Parts', to: '/spare-parts' }, { label: product.name }]}
        label={product.category?.name || 'Spare part'}
        title={product.name}
        image={product.image}
        art="parts"
      />

      <Section>
        <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[1.1fr_.9fr]">
          <div className="grid content-start gap-4">
            <button type="button" className="cursor-zoom-in" onClick={() => images.length && setOpen(0)} aria-label="Enlarge product image">
              <Media image={images[0]} art="parts" className="aspect-[4/3] rounded-xs" sizes="(max-width: 1024px) 100vw, 55vw" />
            </button>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.slice(1).map((image, index) => (
                  <button key={image.id} type="button" onClick={() => setOpen(index + 1)} aria-label={`View image ${index + 2}`} className="cursor-zoom-in">
                    <Media image={image} art="parts" className="aspect-square rounded-xs" sizes="120px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid content-start gap-8">
            {product.short_description && <p className="text-lead text-grey-600">{product.short_description}</p>}
            {facts.length > 0 && (
              <dl className="grid border-t border-grey-200">
                {facts.map(([term, value]) => (
                  <div key={term} className="grid grid-cols-[140px_1fr] gap-4 border-b border-grey-200 py-4">
                    <dt className="font-mono text-[.7rem] uppercase tracking-[.16em] text-grey-600">{term}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="flex flex-wrap gap-3">
              {waHref && (
                <Button to={waHref} variant="whatsapp" icon="none">
                  Ask on WhatsApp
                </Button>
              )}
              <Button to="#request" variant="ghost" icon="none">
                Request a quote
              </Button>
            </div>
            <p className="text-sm text-grey-600">Availability for your exact model is confirmed by our spare parts desk on enquiry.</p>
          </div>
        </div>

        {product.description && (
          <div className="wrap mt-16 max-w-[56rem]">
            <h2>
              <SectionLabel>Details</SectionLabel>
            </h2>
            <RichText html={product.description} className="mt-6 text-grey-600" />
          </div>
        )}
      </Section>

      <Section theme="off" id="request">
        <div className="wrap grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="grid content-start gap-5">
            <SectionLabel>Spare Parts Desk</SectionLabel>
            <h2 className="text-h2">Request this part.</h2>
            <p className="text-lead text-grey-600">Leave your number and our team will confirm price and availability.</p>
          </div>
          <PartRequestForm product={product} />
        </div>
      </Section>

      {!!data.related?.length && (
        <Section>
          <div className="wrap">
            <h2>
              <SectionLabel>Related parts</SectionLabel>
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {data.related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </div>
        </Section>
      )}

      <Lightbox items={lightboxItems} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  )
}
