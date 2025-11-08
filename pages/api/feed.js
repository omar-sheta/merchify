import fs from 'fs'
import path from 'path'
import { FALLBACK_CAPTURE_IMAGE } from '../../lib/placeholders'

export default function handler(req, res) {
  const feedRoot = path.join(process.cwd(), 'public', 'feed')
  if (!fs.existsSync(feedRoot)) {
    return res.status(200).json({ items: [] })
  }

  const creators = fs.readdirSync(feedRoot, { withFileTypes: true }).filter(d => d.isDirectory())
  const items = []

  creators.forEach((creator) => {
    const creatorPath = path.join(feedRoot, creator.name)
    const files = fs.readdirSync(creatorPath)
      .filter(f => f.match(/\.(mp4|webm|ogg)$/i))
    files.forEach((file, idx) => {
      items.push({
        id: `${creator.name}-${idx}`,
        title: `${creator.name} - ${file}`,
        src: `/feed/${creator.name}/${file}`,
  poster: FALLBACK_CAPTURE_IMAGE
      })
    })
  })

  return res.status(200).json({ items })
}
