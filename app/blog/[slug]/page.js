import client from '../../../lib/sanity';
import styles from '../../../components/Bloglist/Bloglist.module.css';
import { PortableText } from '@portabletext/react'
import Header from '../../../components/Header/header';
import Footer from '../../../components/Footer/footer';


export const revalidate = 0;

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ slug }`)
  return posts.map(post => ({ slug: post.slug.current }))
}

export default async function BlogPostPage({ params }) {
  const { slug } = params;

  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      publishedAt,
      body,
      "author": author->{
        name,
        image
      }
    }`,
    { slug }
  )

  if (!post) return <p>Post not found</p>


  return (
    <>
      <Header />
        <main className={styles.blogs}>
            <div className={styles.blogs__wrapper}>
                <h1 className={styles.blog__title}>{post.title}</h1>
                <div className={styles.blog__byline}>
                    <img src="../images/calender-ico.svg"/><span>{new Date(post.publishedAt).toLocaleDateString('mr-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</span> | <span>लेखक: {post.author?.name}</span>
                </div>
                <PortableText value={post.body} />
            </div>
        </main>
        <Footer />
    </>
  )
}