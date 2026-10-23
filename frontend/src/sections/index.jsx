import { HomeHero, PageHero } from './heroes'
import { ApplicationForm, JobList } from './careers'
import { BusinessCards, Faq, FeatureGrid, Mobility, NumberedCards, PartsFeature, Stats, Testimonials, TimelineSection, Values, VehicleCards } from './cards'
import { ContactDesks, ContactForm, Locations, MapSection } from './contact'
import { CsrFocusAreas, ProjectGrid } from './csr'
import { CtaBand, CtaInline } from './cta'
import { Gallery, GalleryPreview } from './gallery'
import { AmenityGrid, HotelReservation, RoomGrid } from './hotel'
import { CsrFeature, HotelFeature, ImageMosaic, IntroSplit, RichTextSection, TextImage } from './media'
import { BrandGrid, FeaturedProducts, PartFinder, ProductCatalogue, ProductCategories } from './spareParts'
import { ChairmanMessage, HeadlineSplit, Heritage, Journey, LinkRows, Statements, StorySplit } from './story'
import { FleetGrid, ServiceGrid, TransportEnquiry } from './transport'

/**
 * CMS section type → React component. Types are defined (with their editable
 * fields) in backend/app/Cms/SectionRegistry.php.
 */
export const SECTIONS = {
  home_hero: HomeHero,
  page_hero: PageHero,
  heritage: Heritage,
  story_split: StorySplit,
  journey: Journey,
  headline_split: HeadlineSplit,
  statements: Statements,
  chairman_message: ChairmanMessage,
  link_rows: LinkRows,
  business_cards: BusinessCards,
  parts_feature: PartsFeature,
  vehicle_cards: VehicleCards,
  mobility: Mobility,
  feature_grid: FeatureGrid,
  numbered_cards: NumberedCards,
  values: Values,
  stats: Stats,
  timeline: TimelineSection,
  testimonials: Testimonials,
  faq: Faq,
  intro_split: IntroSplit,
  text_image: TextImage,
  hotel_feature: HotelFeature,
  csr_feature: CsrFeature,
  image_mosaic: ImageMosaic,
  rich_text: RichTextSection,
  cta_band: CtaBand,
  cta_inline: CtaInline,
  product_categories: ProductCategories,
  part_finder: PartFinder,
  product_catalogue: ProductCatalogue,
  featured_products: FeaturedProducts,
  brand_grid: BrandGrid,
  fleet_grid: FleetGrid,
  service_grid: ServiceGrid,
  transport_enquiry: TransportEnquiry,
  room_grid: RoomGrid,
  amenity_grid: AmenityGrid,
  hotel_reservation: HotelReservation,
  csr_focus_areas: CsrFocusAreas,
  project_grid: ProjectGrid,
  gallery: Gallery,
  gallery_preview: GalleryPreview,
  job_list: JobList,
  application_form: ApplicationForm,
  contact_desks: ContactDesks,
  locations: Locations,
  contact_form: ContactForm,
  map: MapSection,
}

export function SectionRenderer({ sections, page }) {
  return sections.map((section) => {
    const Component = SECTIONS[section.type]
    if (!Component) {
      if (import.meta.env.DEV) console.warn(`No component for section type "${section.type}"`)
      return null
    }
    return <Component key={section.id} section={section} page={page} />
  })
}
