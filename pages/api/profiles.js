import { getAllProfiles, getProfileById } from '../../lib/videos'

export default async function handler(req, res) {
  const { id } = req.query
  
  try {
    if (id) {
      // Get single profile
      const profile = await getProfileById(id)
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }
      return res.status(200).json(profile)
    } else {
      // Get all profiles
      const profiles = await getAllProfiles()
      return res.status(200).json({ profiles })
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return res.status(500).json({ error: 'Failed to fetch profiles' })
  }
}
