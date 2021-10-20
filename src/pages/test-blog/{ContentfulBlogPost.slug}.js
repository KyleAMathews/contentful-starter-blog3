import React from "react"
import {graphql} from "gatsby"

export default function Component (props) {
  console.log(props)
  return props.data.contentfulBlogPost.title
}

export const query = graphql`
  query ($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
    }
  }
`
