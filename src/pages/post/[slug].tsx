import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const [formatedDate, SetFormatedDate] = useState('');

  if (router.isFallback) {
    return (
      <>
        <Header />
        <div>Carregando...</div>
      </>
    );
  }

  useEffect(() => {
    const formatedData = format(
      new Date(post.first_publication_date),
      `dd LLL yyyy`,
      {
        locale: ptBR,
      }
    );

    SetFormatedDate(formatedData);
  }, [post]);

  return (
    <>
      <Head>
        <title>{post.data.title} | IgNews</title>
      </Head>

      <main className={styles.container}>
        <Header />

        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <time>{formatedDate}</time>
          <p>{post.data.author}</p>
          <p>4 min</p>

          {post.data.content.map(postContent => (
            <div className={styles.postContent} key={postContent.heading}>
              <h1>{postContent.heading}</h1>

              <div
                className={`${styles.postContent} ${styles.previewContent}`}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(postContent.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const { results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle', 'posts.content'],
    }
  );

  const paths = results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});
  return {
    props: {
      post: response,
    },
    revalidate: 3600,
  };
};
