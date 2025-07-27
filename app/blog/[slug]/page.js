import client from '../../../lib/sanity';
import styles from '../../../components/Bloglist/Bloglist.module.css';
import { PortableText } from '@portabletext/react'
import Header from '../../../components/Header/header';
import Footer from '../../../components/Footer/footer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
async function getPost(slug) {
  const query =  `*[_type == "post" && slug.current == $slug][0]{
      title,
      publishedAt,
      body,
      "author": author->{
        name,
        image
      }
    }`

    const post = await client.fetch(query, { slug })

    return post 
}


export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug)

  if(!post) {
    notFound()
  }


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