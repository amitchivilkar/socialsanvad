import Link from 'next/link';
import { SanityDocument } from 'next-sanity';
import client from '../../lib/sanity';
import styles from './Bloglist.module.css';


// export const dynamic = 'force-dynamic';
// export const revalidate = 60;


const POSTS_QUERY = `*[_type == "post" && defined(publishedAt) && publishedAt < now()] | order(publishedAt desc){
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "author": author->{
        name
      }
}`;
 

export default async function Bloglist() {
    const posts = await client.fetch(
        POSTS_QUERY,
        {}, 
        { next: { revalidate: 30 } }
    );

    return (
        <>
            <main className={styles.blogs}>
                <div className={styles.blogs__wrapper}>
                    {posts.map((post) => (
                    <div key={post._id} className={styles.blog__card}>
                        
                        <div className={styles.blog__byline}>
                            <span>{new Date(post.publishedAt).toLocaleDateString('mr-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</span> / <span>{post.author?.name}</span></div>
                    <Link href={`/blog/${post.slug.current}`} className={styles.blog__title}>{post.title}</Link>
                    </div>
                    ))}
                </div>
            </main>
        </>
    )
}