// lib/sanity.js
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: '7i9mcu2x',     // Replace with your actual projectId
  dataset: 'production',            // Or whatever dataset you use
  apiVersion: '2023-01-01',         // Use a fixed date for versioning
  useCdn: true                      // `false` if you want latest data (like in preview mode)
})
 export default client