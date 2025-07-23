export const getAllPosts = async () => {
  const query = `*[_type == "post"] | order(_createdAt desc){
    _id,
    title,
    slug,
    excerpt,
    body,
    _createdAt
  }`

  const posts = await client.fetch(query)
  return posts
}