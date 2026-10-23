import Icon from '../components/common/Icon'
import { formatDate } from '../lib/format'
import { col } from './components/ResourceManager'
import { Badge, STATUS_TONES } from './components/ui'

const slug = { key: 'slug', type: 'text', label: 'URL slug', half: true, help: 'Leave empty to create it from the name.' }
const active = { key: 'is_active', type: 'toggle', label: 'Show on website', half: true, on_label: 'Visible', off_label: 'Hidden' }
const featured = { key: 'is_featured', type: 'toggle', label: 'Featured', half: true, on_label: 'Featured', off_label: 'Not featured' }
const seo = [
  { key: 'meta_title', type: 'text', label: 'SEO title', help: 'Optional. Defaults to the name.' },
  { key: 'meta_description', type: 'textarea', label: 'SEO description', rows: 2 },
]
const iconCol = { key: 'icon', label: '', className: 'w-12', render: (row) => row.icon && <Icon name={row.icon} className="size-6 text-navy-700" strokeWidth={1.4} /> }
const site = (path) => (row) => `${path}/${row.slug}`

/** Simple lookup modules share one shape. */
function taxonomy({ endpoint, title, singular, description, mediaKey, mediaLabel = 'Image', icon = false, countLabel = 'Items', emptyText }) {
  return {
    endpoint,
    title,
    singular,
    description,
    emptyText,
    reorderable: true,
    toggles: ['is_active'],
    defaults: { is_active: true },
    columns: [
      ...(icon ? [iconCol] : []),
      ...(mediaKey ? [col.image(mediaKey.replace('_id', ''))] : []),
      col.title('name', (row) => row.description),
      col.text('items_count', countLabel),
    ],
    fields: [
      { key: 'name', type: 'text', label: 'Name', required: true, half: true },
      slug,
      ...(icon ? [{ key: 'icon', type: 'icon', label: 'Icon' }] : []),
      { key: 'description', type: 'textarea', label: 'Short description', rows: 2 },
      ...(mediaKey ? [{ key: mediaKey, type: 'media', label: mediaLabel }] : []),
      active,
    ],
  }
}

export const RESOURCES = {
  products: {
    endpoint: 'products',
    title: 'Products',
    singular: 'product',
    softDeletes: true,
    description: 'Tata & Leyland spare parts shown in the catalogue and part finder. Only add parts you actually stock.',
    emptyText: 'Add your first spare part to switch on the catalogue on the Spare Parts page.',
    searchPlaceholder: 'Search name, SKU or description',
    preview: site('/spare-parts'),
    defaults: { is_active: true, is_featured: false, vehicle_type_ids: [], gallery_ids: [] },
    columns: [col.image(), col.title('name', (row) => row.sku && `#${row.sku}`), col.text('category', 'Category', (v) => v?.name), col.text('brand', 'Brand', (v) => v?.name)],
    fields: [
      { key: 'name', type: 'text', label: 'Product name', required: true },
      slug,
      { key: 'sku', type: 'text', label: 'SKU / part number', half: true },
      { key: 'product_category_id', type: 'relation', endpoint: 'product-categories', label: 'Category', half: true },
      { key: 'brand_id', type: 'relation', endpoint: 'brands', label: 'Brand', half: true },
      { key: 'vehicle_type_ids', type: 'relations', endpoint: 'vehicle-types', label: 'Fits vehicle types' },
      { key: 'short_description', type: 'textarea', label: 'Short description', rows: 2, help: 'Shown on product cards.' },
      { key: 'description', type: 'richtext', label: 'Full description' },
      { key: 'image_id', type: 'media', label: 'Main image' },
      { key: 'gallery_ids', type: 'gallery', label: 'Additional images' },
      active,
      featured,
      ...seo,
    ],
    groups: [
      { title: 'Product', keys: ['name', 'slug', 'sku', 'product_category_id', 'brand_id', 'vehicle_type_ids', 'short_description', 'description'] },
      { title: 'Images', keys: ['image_id', 'gallery_ids'] },
      { title: 'Search engines', keys: ['meta_title', 'meta_description'] },
      { title: 'Visibility', keys: ['is_active', 'is_featured'], aside: true },
    ],
  },

  'product-categories': taxonomy({
    endpoint: 'product-categories',
    title: 'Part categories',
    singular: 'category',
    description: 'Systems shown in the category grid and part finder (Engine, Brakes…).',
    mediaKey: 'image_id',
    icon: true,
    countLabel: 'Products',
  }),
  'vehicle-types': taxonomy({ endpoint: 'vehicle-types', title: 'Vehicle types', singular: 'vehicle type', description: 'Lorries, buses, tippers… used to filter parts and label fleet items.', mediaKey: 'image_id', countLabel: 'Products' }),
  brands: taxonomy({
    endpoint: 'brands',
    title: 'Brands',
    singular: 'brand',
    description: 'Brands you import and distribute. Only upload official logos with the brand owner’s permission.',
    mediaKey: 'logo_id',
    mediaLabel: 'Logo (optional)',
    countLabel: 'Products',
  }),
  'csr-categories': taxonomy({ endpoint: 'csr-categories', title: 'CSR focus areas', singular: 'focus area', description: 'Pillars on the CSR page and categories for CSR projects.', icon: true, countLabel: 'Projects' }),
  'gallery-albums': { ...taxonomy({ endpoint: 'gallery-albums', title: 'Albums', singular: 'album', description: 'Categories used to filter the website gallery.', mediaKey: 'cover_id', mediaLabel: 'Cover image', countLabel: 'Photos' }), crumbs: [{ label: 'Gallery', to: '/admin/gallery' }] },

  'transportation-services': {
    endpoint: 'transportation-services',
    title: 'Transport services',
    singular: 'service',
    softDeletes: true,
    description: 'Service cards on the Transportation page; titles also fill the request form’s service list.',
    reorderable: true,
    defaults: { is_active: true, is_featured: true },
    columns: [iconCol, col.title('title', (row) => row.description)],
    fields: [
      { key: 'title', type: 'text', label: 'Title', required: true, half: true },
      slug,
      { key: 'icon', type: 'icon', label: 'Icon' },
      { key: 'description', type: 'textarea', label: 'Description', rows: 3 },
      { key: 'image_id', type: 'media', label: 'Image (optional)' },
      active,
      featured,
    ],
  },

  'fleet-items': {
    endpoint: 'fleet-items',
    title: 'Fleet',
    singular: 'fleet item',
    softDeletes: true,
    description: 'Photo tiles in the fleet mosaic. Add capacity and details only when confirmed.',
    reorderable: true,
    defaults: { is_active: true, is_featured: false, gallery_ids: [] },
    columns: [col.image(), col.title('name', (row) => row.capacity), col.text('vehicle_type', 'Vehicle type', (v) => v?.name)],
    fields: [
      { key: 'name', type: 'text', label: 'Name', required: true, half: true },
      slug,
      { key: 'vehicle_type_id', type: 'relation', endpoint: 'vehicle-types', label: 'Vehicle type', half: true },
      { key: 'capacity', type: 'text', label: 'Capacity', half: true, help: 'e.g. 54 seats, 10 tonnes' },
      { key: 'description', type: 'textarea', label: 'Short description', rows: 2 },
      { key: 'details', type: 'textarea', label: 'Details', rows: 4 },
      { key: 'image_id', type: 'media', label: 'Main image' },
      { key: 'gallery_ids', type: 'gallery', label: 'More images' },
      active,
      featured,
    ],
    groups: [
      { title: 'Fleet item', keys: ['name', 'slug', 'vehicle_type_id', 'capacity', 'description', 'details'] },
      { title: 'Images', keys: ['image_id', 'gallery_ids'] },
      { title: 'Visibility', keys: ['is_active', 'is_featured'], aside: true },
    ],
  },

  'hotel-rooms': {
    endpoint: 'hotel-rooms',
    title: 'Rooms',
    singular: 'room',
    softDeletes: true,
    description: 'Room types on the Hotel page. Leave the price empty to hide it.',
    reorderable: true,
    defaults: { is_active: true, is_featured: true, status: 'available', amenity_ids: [], gallery_ids: [] },
    columns: [
      col.image(),
      col.title('name', (row) => [row.capacity && `${row.capacity} guests`, row.bed_type].filter(Boolean).join(' · ')),
      { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONES[row.status]}>{row.status}</Badge> },
    ],
    fields: (meta) => [
      { key: 'name', type: 'text', label: 'Room name', required: true, half: true },
      slug,
      { key: 'description', type: 'textarea', label: 'Description', rows: 3 },
      { key: 'capacity', type: 'number', label: 'Guests', min: 1, max: 50, half: true },
      { key: 'bed_type', type: 'text', label: 'Beds', half: true, help: 'e.g. King bed' },
      { key: 'price', type: 'number', label: 'Price (LKR)', min: 0, step: 1, half: true },
      { key: 'price_label', type: 'text', label: 'Price note', half: true, help: 'e.g. per night' },
      { key: 'status', type: 'select', label: 'Availability', required: true, options: meta.room_statuses || [] },
      { key: 'amenity_ids', type: 'relations', endpoint: 'hotel-amenities', label: 'Amenities' },
      { key: 'image_id', type: 'media', label: 'Main image' },
      { key: 'gallery_ids', type: 'gallery', label: 'More images' },
      active,
      featured,
    ],
    groups: [
      { title: 'Room', keys: ['name', 'slug', 'description', 'capacity', 'bed_type', 'price', 'price_label', 'amenity_ids'] },
      { title: 'Images', keys: ['image_id', 'gallery_ids'] },
      { title: 'Availability', keys: ['status', 'is_active', 'is_featured'], aside: true },
    ],
  },

  'hotel-amenities': {
    endpoint: 'hotel-amenities',
    title: 'Amenities',
    singular: 'amenity',
    description: 'Amenity grid on the Hotel page.',
    reorderable: true,
    toggles: ['is_active'],
    defaults: { is_active: true },
    columns: [iconCol, col.title('name', (row) => row.description)],
    fields: [{ key: 'name', type: 'text', label: 'Name', required: true }, { key: 'icon', type: 'icon', label: 'Icon' }, { key: 'description', type: 'textarea', label: 'Description', rows: 2 }, active],
  },

  'csr-projects': {
    endpoint: 'csr-projects',
    title: 'CSR projects',
    singular: 'project',
    softDeletes: true,
    description: 'Community projects. Add dates, locations and impact only when verified.',
    preview: site('/csr'),
    reorderable: true,
    defaults: { is_active: true, is_featured: true, gallery_ids: [] },
    columns: [col.image(), col.title('title', (row) => row.excerpt), col.text('category', 'Focus area', (v) => v?.name), col.text('project_date', 'Date', (v, row) => row.date_label || formatDate(v))],
    fields: [
      { key: 'title', type: 'text', label: 'Title', required: true },
      slug,
      { key: 'csr_category_id', type: 'relation', endpoint: 'csr-categories', label: 'Focus area', half: true },
      { key: 'excerpt', type: 'textarea', label: 'Short description', rows: 2 },
      { key: 'description', type: 'richtext', label: 'Full description' },
      { key: 'project_date', type: 'date', label: 'Date', half: true },
      { key: 'date_label', type: 'text', label: 'Date label', half: true, help: 'Shown instead of the date, e.g. “Ongoing initiative”' },
      { key: 'location', type: 'text', label: 'Location' },
      { key: 'image_id', type: 'media', label: 'Main image' },
      { key: 'gallery_ids', type: 'gallery', label: 'Project gallery' },
      active,
      featured,
      ...seo,
    ],
    groups: [
      { title: 'Project', keys: ['title', 'slug', 'csr_category_id', 'excerpt', 'description', 'project_date', 'date_label', 'location'] },
      { title: 'Images', keys: ['image_id', 'gallery_ids'] },
      { title: 'Search engines', keys: ['meta_title', 'meta_description'] },
      { title: 'Visibility', keys: ['is_active', 'is_featured'], aside: true },
    ],
  },

  careers: {
    endpoint: 'careers',
    title: 'Jobs',
    singular: 'job',
    softDeletes: true,
    description: 'Openings on the Careers page. Published jobs accept applications until their closing date.',
    preview: site('/careers'),
    reorderable: true,
    toggles: [],
    defaults: { status: 'draft', employment_type: 'full_time' },
    filters: [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Draft' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    ],
    columns: [
      col.title('title', (row) => [row.department, row.location].filter(Boolean).join(' · ')),
      { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONES[row.status]}>{row.status}</Badge> },
      col.text('closing_date', 'Closes', (v) => (v ? formatDate(v) : 'Open')),
      col.text('applications_count', 'Applications'),
    ],
    fields: (meta) => [
      { key: 'title', type: 'text', label: 'Job title', required: true },
      slug,
      { key: 'department', type: 'text', label: 'Department', half: true },
      { key: 'location', type: 'text', label: 'Location', half: true },
      { key: 'employment_type', type: 'select', label: 'Employment type', required: true, half: true, options: meta.employment_types || [] },
      { key: 'closing_date', type: 'date', label: 'Closing date', half: true, help: 'Leave empty to keep it open.' },
      { key: 'summary', type: 'textarea', label: 'Summary', rows: 2, help: 'One or two lines shown in the job list.' },
      { key: 'description', type: 'richtext', label: 'About the role' },
      { key: 'responsibilities', type: 'richtext', label: 'Responsibilities' },
      { key: 'requirements', type: 'richtext', label: 'Requirements' },
      { key: 'status', type: 'select', label: 'Status', required: true, options: meta.career_statuses || [], help: 'Only published jobs appear on the website.' },
    ],
    groups: [
      { title: 'Job', keys: ['title', 'slug', 'department', 'location', 'employment_type', 'closing_date', 'summary'] },
      { title: 'Description', keys: ['description', 'responsibilities', 'requirements'] },
      { title: 'Publishing', keys: ['status'], aside: true },
    ],
  },
}
