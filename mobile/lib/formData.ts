import { Platform } from 'react-native'

export type PickedImage = { uri: string; name: string; type: string }

const allowedExtensions = new Set([
  'bmp', 'dib', 'gif', 'jfif', 'jpe', 'jpg', 'jpeg', 'pbm', 'pgm', 'ppm', 'pnm', 'pfm',
  'png', 'apng', 'avif', 'avifs', 'webp', 'tif', 'tiff', 'ico', 'psd', 'qoi',
])

function safeImageExtension(value: string) {
  const extension = value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return allowedExtensions.has(extension) ? extension : 'jpeg'
}

export async function appendImage(fd: FormData, field: string, image: PickedImage) {
  if (Platform.OS === 'web') {
    const res = await fetch(image.uri)
    const blob = await res.blob()
    const uriExtension = image.uri.split('.').pop()?.split('?')[0] ?? ''
    const mimeExtension = (image.type || blob.type).split('/')[1]?.split('+')[0] ?? ''
    const ext = safeImageExtension(uriExtension) !== 'jpeg'
      ? safeImageExtension(uriExtension)
      : safeImageExtension(mimeExtension)
    const mimeType = `image/${ext}`
    const fileName = `upload.${ext}`
    const file = new File([blob], fileName, { type: mimeType })
    fd.append(field, file)
  } else {
    const ext = safeImageExtension(image.name.split('.').pop() ?? image.type.split('/')[1] ?? '')
    fd.append(field, { uri: image.uri, name: `upload.${ext}`, type: `image/${ext}` } as any)
  }
}
