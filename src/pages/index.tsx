import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiUser, FiCalendar, FiBookOpen } from 'react-icons/fi';

import Head from 'next/head';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import styles from './home.module.scss';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formattedDate = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM y',
        { locale: ptBR }
      ),
    };
  });


  const [posts, setPosts] = useState<Post[]>(formattedDate);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  useEffect(() => {
  }, [posts])

  async function handleNextPage() {
    // if (nextPage === null) {
    //   return;
    // }

    const nextPost = await fetch(nextPage).then(response => response.json());


    setNextPage(nextPost.next_page);

    const newPost = nextPost.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'd MMM y',
          { locale: ptBR }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPost]);
  }

  return (
    <>
      <Head>
        <title> Spacetraveling | Home </title>
      </Head>

      <div className={styles.container}>
        <Header />
        <div className={styles.postsContainer}>
          {posts.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <div className={styles.post}>
                  <h2 className={styles.title}>{post.data.title}</h2>
                  <p className={styles.subtitle}>{post.data.subtitle}</p>
                  <div className={styles.infos}>
                    <span className={styles.date}>
                      <FiCalendar />
                      {post.first_publication_date}
                    </span>
                    <span className={styles.author}>
                      <FiUser />
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {!!nextPage && (
          <button className={styles.seeMore} onClick={handleNextPage}>
            Carregar mais posts
          </button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 1 }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
