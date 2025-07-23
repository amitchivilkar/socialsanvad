import { client } from '../../../lib/sanity';
import styles from '../Bloglist.module.css';
import Header from '../../../components/Header/header';
import Footer from '../../../components/Footer/footer';


export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ slug }`)
  return posts.map(post => ({ slug: post.slug.current }))
}

export default async function BlogPostPage({ params }) {
  const slug = params?.slug;

  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      content,
      publishedAt
    }`,
    { slug }
  )

  if (!post) return <p>Post not found</p>

  return (
    <>
        <main className={styles.blogs}>
            <div className={styles.blogs__wrapper}>
                <h1 className={styles.blog__title}>{post.title}</h1>
                <div className={styles.blog__byline}>
                    <span>{new Date(post.publishedAt).toLocaleDateString('mr-IN')}</span>
                </div>
            </div>
        </main>
    </>
  )
}