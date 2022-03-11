import React from "react"
import { Link, graphql } from "gatsby"
import get from "lodash/get"

import Seo from "../components/seo"
import Layout from "../components/layout"
import Hero from "../components/hero"
import * as styles from "./blog-post.module.css"

class BlogPostTemplate extends React.Component {
  render() {
    const post = get(this.props, `data.contentfulBlogPost`)
    const previous = get(this.props, `data.previous`)
    const next = get(this.props, `data.next`)
    const mostRecent = get(this.props, `data.mostRecent.nodes[0]`)

    return (
      <Layout location={this.props.location}>
        <Seo
          title={post.title}
          description={post.description.childMarkdownRemark.excerpt}
        />
        <div className={styles.container}>
          <span className={styles.meta}>
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{` `}
            {post.body.childMarkdownRemark.timeToRead} minute read
          </span>
          <div className={styles.article}>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{
                __html: post.body.childMarkdownRemark.html,
              }}
            />
            {(previous || next) && (
              <nav>
                <ul className={styles.articleNavigation}>
                  {previous && (
                    <li>
                      <Link to={`/blog/${previous.slug}`} rel="prev">
                        ← {previous.title}
                      </Link>
                    </li>
                  )}
                  {next && (
                    <li>
                      <Link to={`/blog/${next.slug}`} rel="next">
                        {next.title} →
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
            {mostRecent && (
              <nav>
                <h3>Most recently updated blog post</h3>
                <ul className={styles.articleNavigation}>
                  {mostRecent && (
                    <li>
                      <Link to={`/blog/${mostRecent.slug}`} rel="prev">
                        {mostRecent.title}
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $slug: String!
    $previousPostSlug: String
    $nextPostSlug: String
  ) {
    contentfulBlogPost(slug: { eq: $slug }) {
      slug
      title
      publishDate(formatString: "MMMM Do, YYYY")
      rawDate: publishDate
      body {
        childMarkdownRemark {
          html
          timeToRead
        }
      }
      description {
        childMarkdownRemark {
          excerpt
        }
      }
    }
    mostRecent: allContentfulBlogPost(
      sort: { fields: [updatedAt], order: DESC }
      limit: 1
    ) {
      nodes {
        title
        slug
      }
    }
    previous: contentfulBlogPost(slug: { eq: $previousPostSlug }) {
      slug
      title
    }
    next: contentfulBlogPost(slug: { eq: $nextPostSlug }) {
      slug
      title
    }
  }
`
