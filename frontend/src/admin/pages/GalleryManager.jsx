import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx } from '../../lib/format'
import { MediaPicker, MediaThumb, rememberMedia } from '../components/media'
import SchemaForm from '../components/SchemaForm'
import { useToast } from '../components/Toast'
import { Badge, Btn, Card, EmptyState, ErrorNotice, IconBtn, Modal, PageHeader, Spinner, Toggle, confirmDialog } from '../components/ui'

const EMPTY = []

function EditImage({ image, albums, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({
    gallery_album_id: image.gallery_album_id,
    media_id: image.media_id,
    title: image.title,
    description: image.description,
    is_active: image.is_active,
    is_featured: image.is_featured,
  })
  const [errors, setErrors] = useState({})

  const save = async () => {
    try {
      onSaved(await api.put(`/admin/gallery-images/${image.id}`, values))
      toast.success('Photo saved.')
      onClose()
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.message)
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit photo" footer={<Btn icon="check" onClick={save}>Save</Btn>}>
      <SchemaForm
        fields={[
          { key: 'media_id', type: 'media', label: 'Image', required: true },
          { key: 'gallery_album_id', type: 'select', label: 'Album', required: true, options: albums.map((a) => ({ value: String(a.id), label: a.name })) },
          { key: 'title', type: 'text', label: 'Title' },
          { key: 'description', type: 'textarea', label: 'Description', rows: 2 },
          { key: 'is_active', type: 'toggle', label: 'Show on website', half: true },
          { key: 'is_featured', type: 'toggle', label: 'Featured', half: true, help: 'Featured photos can appear on the home page.' },
        ]}
        value={{ ...values, gallery_album_id: String(values.gallery_album_id ?? '') }}
        onChange={(v) => setValues({ ...v, gallery_album_id: v.gallery_album_id ? Number(v.gallery_album_id) : null })}
        errors={errors}
      />
    </Modal>
  )
}

/** Album tabs + photo grid with bulk add, reorder, feature/hide and edit. */
export default function GalleryManager() {
  const toast = useToast()
  const { data: albumData } = useApi('/admin/gallery-albums', { per_page: 100 }, { cache: false })
  const albums = albumData?.data || EMPTY
  const [albumId, setAlbumId] = useState(null)
  const [images, setImages] = useState(null)
  const [error, setError] = useState(null)
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!albumId && albums.length) setAlbumId(albums[0].id)
  }, [albums, albumId])

  useEffect(() => {
    if (!albumId) return
    setImages(null)
    api
      .get('/admin/gallery-images', { album_id: albumId, per_page: 200 })
      .then((res) => {
        rememberMedia(res.data.map((i) => i.image))
        setImages(res.data)
      })
      .catch(setError)
  }, [albumId])

  const add = async (picked) => {
    try {
      const res = await api.post('/admin/gallery-images/bulk', { gallery_album_id: albumId, media_ids: picked.map((m) => m.id) })
      setImages((list) => [...(list || []), ...res.data])
      toast.success(res.message)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const move = async (index, delta) => {
    const next = [...images]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    setImages(next)
    await api.post('/admin/gallery-images/reorder', { ids: next.map((i) => i.id) }).catch((e) => toast.error(e.message))
  }

  const toggle = async (image, field) => {
    setImages((list) => list.map((i) => (i.id === image.id ? { ...i, [field]: !i[field] } : i)))
    await api.patch(`/admin/gallery-images/${image.id}/toggle`, { field }).catch((e) => toast.error(e.message))
  }

  const remove = async (image) => {
    if (!(await confirmDialog({ title: 'Remove photo from gallery?', message: 'The photo stays in the media library and can be added again.', confirmLabel: 'Remove' }))) return
    try {
      await api.delete(`/admin/gallery-images/${image.id}`)
      setImages((list) => list.filter((i) => i.id !== image.id))
      toast.success('Photo removed from the gallery.')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const album = albums.find((a) => a.id === albumId)

  return (
    <>
      <PageHeader
        title="Gallery"
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Gallery' }]}
        description="Photos on the Gallery page, grouped by album. Order here is the order on the website."
        actions={
          <>
            <Btn variant="secondary" icon="layers" to="/admin/gallery/albums">
              Manage albums
            </Btn>
            <Btn icon="plus" disabled={!albumId} onClick={() => setPicking(true)}>
              Add photos
            </Btn>
          </>
        }
      />
      <ErrorNotice error={error} />
      {!albumData ? (
        <Spinner />
      ) : !albums.length ? (
        <EmptyState title="No albums yet" text="Create an album first, then add photos to it." action={<Btn to="/admin/gallery/albums/new" icon="plus">Create album</Btn>} />
      ) : (
        <Card padded={false}>
          <div role="tablist" aria-label="Albums" className="flex flex-wrap gap-1 border-b border-grey-100 px-3 pt-3">
            {albums.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={a.id === albumId}
                onClick={() => setAlbumId(a.id)}
                className={cx('-mb-px rounded-t-md border px-4 py-2 text-sm', a.id === albumId ? 'border-grey-200 border-b-white bg-white font-semibold' : 'border-transparent text-grey-600 hover:text-navy-900')}
              >
                {a.name} <span className="text-xs text-grey-400">{a.items_count}</span>
                {!a.is_active && <span className="ml-1.5"><Badge>hidden</Badge></span>}
              </button>
            ))}
          </div>
          {!images ? (
            <Spinner />
          ) : images.length ? (
            <ul className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <li key={image.id} className={cx('overflow-hidden rounded-md border bg-white', image.is_active ? 'border-grey-200' : 'border-dashed border-grey-400 opacity-60')}>
                  <button type="button" className="block w-full" onClick={() => setEditing(image)} aria-label={`Edit ${image.title || 'photo'}`}>
                    <MediaThumb media={image.image} className="aspect-[4/3] w-full" />
                  </button>
                  <div className="grid gap-2 p-2.5">
                    <p className="truncate text-xs font-semibold">{image.title || 'Untitled'}</p>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[.68rem] text-grey-600">
                        <Toggle checked={image.is_featured} onChange={() => toggle(image, 'is_featured')} label="Featured" /> Featured
                      </label>
                      <div className="flex">
                        <IconBtn icon="left" label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)} />
                        <IconBtn icon="right" label="Move later" disabled={index === images.length - 1} onClick={() => move(index, 1)} />
                        <IconBtn icon={image.is_active ? 'eye' : 'eye-off'} label={image.is_active ? 'Hide' : 'Show'} onClick={() => toggle(image, 'is_active')} />
                        <IconBtn icon="trash" tone="danger" label="Remove" onClick={() => remove(image)} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="image" title={`No photos in ${album?.name}`} action={<Btn icon="plus" onClick={() => setPicking(true)}>Add photos</Btn>} />
          )}
        </Card>
      )}
      <MediaPicker open={picking} multiple onClose={() => setPicking(false)} onSelect={add} />
      {editing && (
        <EditImage
          image={editing}
          albums={albums}
          onClose={() => setEditing(null)}
          onSaved={(saved) => setImages((list) => (saved.gallery_album_id === albumId ? list.map((i) => (i.id === saved.id ? saved : i)) : list.filter((i) => i.id !== saved.id)))}
        />
      )}
    </>
  )
}
