import { GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { useCallback, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
  const [listOfPosts, setListOfPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = useCallback(async () => {
    try {
      const { results, next_page: newNextPage } = await fetch(
        nextPage
      ).then(response => response.json());

      setNextPage(newNextPage);
      setListOfPosts([...listOfPosts, ...results]);
    } catch (e) {
      console.log('Error loading posts:', e.message);
    }
  }, [listOfPosts, nextPage]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={styles.container}>
        <Header />

        <div className={styles.posts}>
          {listOfPosts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.postContent}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>

                <div>
                  <div>
                    <FiCalendar />
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <FiUser />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>

      {nextPage && (
        <button onClick={handleLoadMorePosts} type="button">
          Carregar mais posts
        </button>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
    }
  );

  results.map(result => {
    const formatedData = format(
      new Date(result.first_publication_date),
      `dd LLL yyyy`,
      {
        locale: ptBR,
      }
    );

    result.first_publication_date = formatedData;

    return result;
  });

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
