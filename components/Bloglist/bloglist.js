import Link from 'next/link';
import client from '../../lib/sanity';
import styles from './Bloglist.module.css';

export const metadata = {
    title: 'Social Sanvad Blog',
}

async function getPosts() {
    const query = `*[_type == "post"] | order(_createdAt desc){
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "author": author->{
        name
      }
  }`
  return await client.fetch(query)
}

export default async function Bloglist() {
    const posts = await getPosts()
    return (
        <>
            <main className={styles.blogs}>
                <div className={styles.blogs__wrapper}>
                    {posts.map((post) => (
                    <div key={post._id} className={styles.blog__card}>
                        <Link href={`/blog/${post.slug.current}`} className={styles.blog__title}>{post.title}</Link>
                        <div className={styles.blog__byline}>
                             <img src="../images/calender-ico.svg"/><span><i className="calender"></i> {new Date(post.publishedAt).toLocaleDateString('mr-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</span> | <span>लेखक: {post.author?.name}</span></div>
                    </div>
                    ))}
                </div>
            </main>
        </>
    )
}