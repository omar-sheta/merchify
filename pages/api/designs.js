import { getAllDesigns } from '../../lib/firestore'

export default async function handler(req, res) {
  try {
    // Fetch all designs from Firestore
    const designs = await getAllDesigns()
    
    return res.status(200).json({ designs })
  } catch (error) {
    console.error('Error fetching designs:', error)
    return res.status(500).json({ error: 'Failed to fetch designs' })
  }
}
